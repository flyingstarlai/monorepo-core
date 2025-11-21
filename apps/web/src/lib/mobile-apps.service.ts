import { apiClient } from './api-client';

export interface LoginHistoryRecord {
  key: string;
  username: string;
  appId: string;
  success: boolean;
  failureReason: string | null;
  loginAt: string;
  accountId: string | null;
  appName: string | null;
  appVersion: string | null;
  appModule: string | null;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoginHistoryQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  deviceId?: string;
}

export interface PaginatedLoginHistoryResponse {
  data: LoginHistoryRecord[];
  pagination: PaginationMetadata;
}

export interface MobileAppOverviewDto {
  appId: string;
  appName: string;
  activeDevices: number;
  totalDevices: number;
  companies: number;
  uniqueUsers: number;
}

export interface AppDeviceDto {
  id: string;
  appId: string;
  appName: string;
  appVersion: string;
  name: string;
  company: string;
  isActive: boolean;
}

export async function getMobileAppsOverview(): Promise<MobileAppOverviewDto[]> {
  const response = await apiClient.get('/mobile-apps');
  return response.data as MobileAppOverviewDto[];
}

export async function getDevicesByAppId(
  appId: string,
  appName?: string,
): Promise<AppDeviceDto[]> {
  const response = await apiClient.get(`/mobile-apps/${appId}`, {
    params: {
      ...(appName && { appName }),
    },
  });
  return response.data as AppDeviceDto[];
}

export async function getLoginHistoryByAppId(
  appId: string,
  params?: LoginHistoryQueryParams,
  appName?: string,
): Promise<PaginatedLoginHistoryResponse> {
  const response = await apiClient.get(`/mobile-apps/${appId}/login-history`, {
    params: {
      ...params,
      ...(appName && { appName }),
    },
  });
  return response.data as PaginatedLoginHistoryResponse;
}
