/**
 * 通知模块 - 已禁用
 * 此功能依赖外部通知服务，本地版本不支持
 */

export type NotificationPayload = {
  title: string;
  content: string;
};

/**
 * 发送通知给项目所有者
 * 本地版本中此功能已禁用
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  console.log("[Notification] Notification disabled in local version:", payload);
  return false;
}

