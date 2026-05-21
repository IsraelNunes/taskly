import { ForbiddenException } from '@nestjs/common';
import { ProfileRole } from '../constants/profile-role';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export function roleFromUser(user?: JwtPayload | null): ProfileRole | null {
  if (!user?.perfil) {
    return null;
  }

  return user.perfil as ProfileRole;
}

export function ensureRole(user: JwtPayload, allowed: ProfileRole[], message?: string): void {
  if (!allowed.includes(user.perfil as ProfileRole)) {
    throw new ForbiddenException(message ?? 'Perfil sem permissão para esta ação.');
  }
}

export function isOneOf(role: string | null | undefined, allowed: ProfileRole[]): boolean {
  if (!role) {
    return false;
  }

  return allowed.includes(role as ProfileRole);
}
