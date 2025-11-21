import { MobileApp } from '../entities/mobile-app.entity';

export class AppDeviceDto {
  id: string;
  appId: string;
  appName: string;
  appVersion: string;
  name: string;
  company: string;
  isActive: boolean;
}

export function toAppDeviceDto(mobileApp: MobileApp): AppDeviceDto {
  return {
    id: mobileApp.id,
    appId: mobileApp.appId,
    appName: mobileApp.appName,
    appVersion: mobileApp.appVersion,
    name: mobileApp.name,
    company: mobileApp.company,
    isActive: mobileApp.isActive,
  };
}
