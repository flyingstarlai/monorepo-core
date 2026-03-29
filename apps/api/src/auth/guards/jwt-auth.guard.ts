import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    const authHeader = request.headers['authorization'];

    this.logger.log('=== JWT AUTH GUARD ===');
    this.logger.log(`Request URL: ${url}`);
    this.logger.log(
      `Authorization header: ${authHeader ? authHeader.substring(0, 50) : 'NONE'}`,
    );
    this.logger.log(
      `User from strategy: ${
        user ? JSON.stringify({ id: user.id, username: user.username }) : 'NONE'
      }`,
    );

    if (user) {
      return user;
    }

    throw err || new UnauthorizedException();
  }
}
