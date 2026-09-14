import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '@shared/decorators';
import { TokenUtil } from '@shared/utils';
import { UserRole } from '@shared/enums';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: AuthenticatedUser;
    }>();

    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret || secret.trim() === '') {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing or empty. A secure JWT secret must be configured.',
      );
    }

    if (token) {
      const payload = TokenUtil.verify(token, secret);
      if (payload) {
        request.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
        return true;
      }
    }

    if (isPublic) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    throw new UnauthorizedException('Invalid or expired authentication token');
  }
}
