import { LoginHistory } from '../entities/login-history.entity';

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedLoginHistoryDto {
  data: LoginHistory[];
  pagination: PaginationMetadata;
}
