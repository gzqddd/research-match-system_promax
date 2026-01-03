export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
/**
 * 登录地址：使用本地邮箱/密码登录页
 * （原先的外部 OAuth 已移除，避免无效 URL 报错）
 */
export const getLoginUrl = () => {
  return `${window.location.origin}/login`;
};
