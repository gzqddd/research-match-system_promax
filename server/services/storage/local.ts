/**
 * 本地文件存储模块 - 替代外部存储服务
 * 使用本地文件系统存储上传的文件
 */

import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

// 存储目录
const STORAGE_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_URL_PREFIX = "/uploads";

// 确保存储目录存在
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * 生成唯一的文件名
 */
function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const random = randomBytes(8).toString("hex");
  return `${name}-${random}${ext}`;
}

/**
 * 上传文件到本地存储
 * @param relKey 相对路径 (例如: "resumes/user-123")
 * @param data 文件内容
 * @param contentType 文件类型
 * @returns 文件信息 { key, url }
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; url: string }> {
  ensureStorageDir();

  // 规范化路径
  const normalizedKey = relKey.replace(/^\/+/, "").replace(/\\/g, "/");
  const filePath = path.join(STORAGE_DIR, normalizedKey);

  // 确保目录存在
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 写入文件
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);

  // 返回文件信息
  const url = `${PUBLIC_URL_PREFIX}/${normalizedKey}`;
  return {
    key: normalizedKey,
    url,
  };
}

/**
 * 获取文件的公开URL
 * @param relKey 相对路径
 * @param expiresIn 过期时间 (本地存储不使用此参数)
 * @returns 文件信息 { key, url }
 */
export async function storageGet(
  relKey: string,
  expiresIn?: number
): Promise<{ key: string; url: string }> {
  const normalizedKey = relKey.replace(/^\/+/, "").replace(/\\/g, "/");
  const filePath = path.join(STORAGE_DIR, normalizedKey);

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${relKey}`);
  }

  const url = `${PUBLIC_URL_PREFIX}/${normalizedKey}`;
  return {
    key: normalizedKey,
    url,
  };
}

/**
 * 删除文件
 * @param relKey 相对路径
 */
export async function storageDelete(relKey: string): Promise<void> {
  const normalizedKey = relKey.replace(/^\/+/, "").replace(/\\/g, "/");
  const filePath = path.join(STORAGE_DIR, normalizedKey);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * 列出目录下的文件
 * @param relDir 相对目录路径
 */
export async function storageList(relDir: string): Promise<string[]> {
  const normalizedDir = relDir.replace(/^\/+/, "").replace(/\\/g, "/");
  const dirPath = path.join(STORAGE_DIR, normalizedDir);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  return files
    .filter((file) => file.isFile())
    .map((file) => `${normalizedDir}/${file.name}`);
}

/**
 * 读取文件内容
 * @param relKey 相对路径
 */
export async function storageRead(relKey: string): Promise<Buffer> {
  const normalizedKey = relKey.replace(/^\/+/, "").replace(/\\/g, "/");
  const filePath = path.join(STORAGE_DIR, normalizedKey);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${relKey}`);
  }

  return fs.readFileSync(filePath);
}

/**
 * 检查文件是否存在
 * @param relKey 相对路径
 */
export async function storageExists(relKey: string): Promise<boolean> {
  const normalizedKey = relKey.replace(/^\/+/, "").replace(/\\/g, "/");
  const filePath = path.join(STORAGE_DIR, normalizedKey);
  return fs.existsSync(filePath);
}

/**
 * 获取文件大小
 * @param relKey 相对路径
 */
export async function storageSize(relKey: string): Promise<number> {
  const normalizedKey = relKey.replace(/^\/+/, "").replace(/\\/g, "/");
  const filePath = path.join(STORAGE_DIR, normalizedKey);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${relKey}`);
  }

  const stats = fs.statSync(filePath);
  return stats.size;
}

