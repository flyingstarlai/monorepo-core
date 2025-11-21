export class MobileLoginHistoryDto {
  userId: string;
  logId: string;
  loginAt: string;
  success: boolean;
  failureReason: string | null;
  deviceId: string | null;
  appName: string | null;
  appVersion: string | null;
  appModule: string | null;
}
