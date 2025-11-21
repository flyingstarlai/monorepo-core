import { PaginatedLoginHistoryDto } from '../../mobile-apps/dto/paginated-login-history.dto';
import { LoginHistoryQueryDto } from '../../mobile-apps/dto/login-history-query.dto';

export interface IUsersService {
  findLoginHistoryByDeviceId(
    appId: string,
    query: LoginHistoryQueryDto,
  ): Promise<PaginatedLoginHistoryDto>;
}
