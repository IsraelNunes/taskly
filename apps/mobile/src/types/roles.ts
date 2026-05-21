export type ProfileRole = 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN';

export function isAdmin(role: ProfileRole | null | undefined): boolean {
  return role === 'ADMIN';
}

export function isProfissional(role: ProfileRole | null | undefined): boolean {
  return role === 'PROFISSIONAL';
}

export function isCliente(role: ProfileRole | null | undefined): boolean {
  return role === 'CLIENTE';
}

// kept for compatibility — any authenticated user satisfies "min role"
export function hasMinRole(role: ProfileRole | null | undefined, _required: ProfileRole): boolean {
  return !!role;
}
