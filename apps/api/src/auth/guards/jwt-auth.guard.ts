import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    const authHeader = request.headers['authorization'];
    const altHeader = request.headers['x-onlyoffice-secret'];
    const onlyofficeSecret = process.env.ONLYOFFICE_JWT_SECRET;

    let hasValidOnlyofficeToken = false;

    if (
      !user &&
      typeof onlyofficeSecret === 'string' &&
      onlyofficeSecret.length > 0
    ) {
      const candidateTokens: Array<string | undefined> = [];

      if (typeof authHeader === 'string' && authHeader.length > 0) {
        candidateTokens.push(this.extractToken(authHeader));
      }

      if (typeof altHeader === 'string' && altHeader.length > 0) {
        candidateTokens.push(this.extractToken(altHeader));
      }

      for (const token of candidateTokens) {
        if (!token) {
          continue;
        }

        try {
          jwt.verify(token, onlyofficeSecret);
          hasValidOnlyofficeToken = true;
          break;
        } catch (verifyError) {
          this.logger.warn(
            `Invalid OnlyOffice token for ${url}: ${
              verifyError instanceof Error ? verifyError.message : verifyError
            }`,
          );
        }
      }
    }

    this.logger.log('=== JWT AUTH GUARD ===');
    this.logger.log(`Request URL: ${url}`);
    this.logger.log(
      `Authorization header: ${authHeader ? authHeader.substring(0, 50) : 'NONE'}`,
    );
    this.logger.log(
      `X-OnlyOffice-Secret header: ${
        altHeader ? altHeader.substring(0, 50) : 'NONE'
      }`,
    );
    this.logger.log(
      `OnlyOffice token valid: ${hasValidOnlyofficeToken ? 'YES' : 'NO'}`,
    );
    this.logger.log(
      `User from strategy: ${
        user ? JSON.stringify({ id: user.id, username: user.username }) : 'NONE'
      }`,
    );

    request.onlyofficeAuthorized = hasValidOnlyofficeToken;

    if (user) {
      return user;
    }

    if (hasValidOnlyofficeToken) {
      return null;
    }

    throw err || new UnauthorizedException();
  }

  private extractToken(headerValue: string): string | undefined {
    const trimmed = headerValue.trim();

    if (trimmed.startsWith('Bearer ')) {
      return trimmed.substring(7).trim();
    }

    return trimmed.length > 0 ? trimmed : undefined;
  }
}
