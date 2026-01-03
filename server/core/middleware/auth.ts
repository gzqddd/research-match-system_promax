/**
 * 认证中间件
 * 提供用户认证和会话管理功能
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../../repositories";
import { getSessionCookieOptions } from "./cookies";
import { SignJWT, jwtVerify } from "jose";
import { Config } from "../config";
import type { User } from "../../../drizzle/schema";
import bcrypt from "bcryptjs";

export type SessionPayload = {
  userId: number;
  role: string;
};

/**
 * 创建会话token
 */
export async function createSessionToken(userId: number, role: string): Promise<string> {
  const secret = new TextEncoder().encode(Config.auth.jwtSecret);
  const payload: SessionPayload = {
    userId,
    role,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1y")
    .sign(secret);

  return token;
}

/**
 * 验证会话token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = new TextEncoder().encode(Config.auth.jwtSecret);
    const verified = await jwtVerify(token, secret);
    return verified.payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中获取当前用户
 */
export async function authenticateRequest(req: Request): Promise<User | null> {
  try {
    const cookies = parseCookies(req);
    const token = cookies[COOKIE_NAME];

    if (!token) {
      return null;
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return null;
    }

    const user = await db.getUserById(payload.userId);
    return user || null;
  } catch (error) {
    return null;
  }
}

/**
 * 解析Cookie
 */
function parseCookies(req: Request): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.split("=").map((c) => c.trim());
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * 注册本地认证路由
 */
export function registerLocalAuthRoutes(app: Express) {
  /**
   * 登录接口
   * POST /api/auth/login
   * Body: { email: string, password: string }
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      if (!email.includes("@")) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      // 查询用户
      const user = await db.getUserByEmail(email);

      if (!user) {
        res.status(400).json({ error: "User not found, please register first" });
        return;
      }

      // 验证密码
      const passwordHash = user.passwordHash;
      if (!passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const isValid = await bcrypt.compare(password, passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // 如果前端传了角色，校验与数据库中的角色是否一致，防止任意切换身份
      if (role) {
        const validRoles = ["student", "teacher", "admin"] as const;
        if (!validRoles.includes(role)) {
          res.status(400).json({ error: "Invalid role" });
          return;
        }

        if (user.role && user.role !== role) {
          const roleLabelMap: Record<string, string> = {
            student: "学生",
            teacher: "教师",
            admin: "管理员",
          };
          const currentLabel = roleLabelMap[user.role] || user.role;
          res
            .status(403)
            .json({ error: `当前账号角色为「${currentLabel}」，请切换到对应的登录身份` });
          return;
        }
      }

      // 仅更新最近登录时间，不再在登录时更改用户角色
      await db.updateUserLastSignedIn(user.id);

      const refreshedUser = await db.getUserByEmail(email);
      if (!refreshedUser) {
        res.status(500).json({ error: "Failed to load user" });
        return;
      }

      // 创建会话token
      const sessionToken = await createSessionToken(refreshedUser.id, refreshedUser.role);

      // 设置cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: refreshedUser.id,
          email: refreshedUser.email,
          name: refreshedUser.name,
          role: refreshedUser.role,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * 注册接口
   * POST /api/auth/register
   * Body: { email: string, password: string, name?: string }
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      // 检查用户是否已存在
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      // 验证角色参数
      const validRoles = ["student", "teacher", "admin"];
      const selectedRole = role && validRoles.includes(role) ? role : "student";

      if (password.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters" });
        return;
      }

      // 创建新用户，使用选择的角色
      const passwordHash = await bcrypt.hash(password, 10);
      await db.upsertUser({
        openId: `local_${email}`,
        name: name || email.split("@")[0],
        email,
        loginMethod: "local",
        passwordHash,
        role: selectedRole, // 使用选择的角色
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByEmail(email);

      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // 创建会话token
      const sessionToken = await createSessionToken(user.id, user.role);

      // 设置cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);

      if (!user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error("[LocalAuth] Get user failed", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  /**
   * 登出接口
   * POST /api/auth/logout
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      res.json({ success: true });
    } catch (error) {
      console.error("[LocalAuth] Logout failed", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
}

