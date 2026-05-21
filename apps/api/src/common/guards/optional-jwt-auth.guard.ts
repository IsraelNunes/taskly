import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser | null {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    const hasAuthHeader = Boolean(request.headers.authorization);

    if (err || (hasAuthHeader && info)) {
      throw err instanceof Error ? err : new UnauthorizedException('Token inválido.');
    }

    return user ?? null;
  }
}
