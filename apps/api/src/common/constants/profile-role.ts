export const PROFILE_ROLES = ['CLIENTE', 'PROFISSIONAL', 'ADMIN'] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

export const isProfileRole = (value: string): value is ProfileRole =>
  PROFILE_ROLES.includes(value as ProfileRole);
