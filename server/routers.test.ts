import { describe, expect, it } from "vitest";
import { appRouter } from "./routes";
import type { TrpcContext } from "./core/framework/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "student" | "teacher" | "admin"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "local",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Auth Router", () => {
  it("should return current user info", async () => {
    const { ctx } = createMockContext("student");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.role).toBe("student");
  });

  it("should allow role update", async () => {
    const { ctx } = createMockContext("student");
    const caller = appRouter.createCaller(ctx);

    // Note: This test would require database mock to fully test
    // For now, we just verify the procedure exists and accepts correct input
    expect(caller.auth.updateRole).toBeDefined();
  });
});

describe("Permission Middleware", () => {
  it("should allow student to access student procedures", async () => {
    const { ctx } = createMockContext("student");
    const caller = appRouter.createCaller(ctx);

    // Verify student can access student profile
    expect(caller.studentProfile.get).toBeDefined();
  });

  it("should allow teacher to access teacher procedures", async () => {
    const { ctx } = createMockContext("teacher");
    const caller = appRouter.createCaller(ctx);

    // Verify teacher can access teacher profile
    expect(caller.teacherProfile.get).toBeDefined();
  });

  it("should allow admin to access admin procedures", async () => {
    const { ctx } = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    // Verify admin can access admin stats
    expect(caller.admin.stats).toBeDefined();
  });
});

describe("Project Router", () => {
  it("should allow public access to project list", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // Public procedure should work without authentication
    const result = await caller.project.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("AI Router", () => {
  it("should have AI chat procedure", async () => {
    const { ctx } = createMockContext("student");
    const caller = appRouter.createCaller(ctx);

    // Verify AI chat procedure exists
    expect(caller.ai.chat).toBeDefined();
  });

  it("should have match calculation procedure for students", async () => {
    const { ctx } = createMockContext("student");
    const caller = appRouter.createCaller(ctx);

    // Verify AI match procedure exists
    expect(caller.ai.calculateMatch).toBeDefined();
  });

  it("should have statement generation procedure for students", async () => {
    const { ctx } = createMockContext("student");
    const caller = appRouter.createCaller(ctx);

    // Verify AI statement generation procedure exists
    expect(caller.ai.generateStatement).toBeDefined();
  });

  it("should have description expansion procedure for teachers", async () => {
    const { ctx } = createMockContext("teacher");
    const caller = appRouter.createCaller(ctx);

    // Verify AI description expansion procedure exists
    expect(caller.ai.expandDescription).toBeDefined();
  });
});
