import { MobileLoginHistoryDto } from '../dto/mobile-login-history.dto';
import { PaginatedLoginHistoryDto } from '../../mobile-apps/dto/paginated-login-history.dto';
import { LoginHistoryQueryDto } from '../../mobile-apps/dto/login-history-query.dto';

export interface IUsersService {
  findLoginHistoryByUserId(
    userId: string,
    limit?: number,
  ): Promise<{
    items: MobileLoginHistoryDto[];
  }>;
  findLoginHistoryByAppId(
    appId: string,
    query: LoginHistoryQueryDto,
  ): Promise<PaginatedLoginHistoryDto>;
}
