export enum Authority {
  ADMIN = 'ROLE_ADMIN',
  USER = 'ROLE_USER',
  PARENT = 'ROLE_PARENT',
  CHILD = 'ROLE_CHILD',
}

export function normalizeAuthority(authority: string | null | undefined): string {
  const value = authority?.trim();
  if (!value) {
    return '';
  }

  return value.startsWith('ROLE_') ? value : `ROLE_${value}`;
}

export function normalizeAuthorities(authorities: string[] | null | undefined): string[] {
  const values = authorities ?? [];
  return [...new Set(values.map(normalizeAuthority).filter(Boolean))];
}

export function hasAnyMatchingAuthority(authorities: string[] | null | undefined, expectedAuthorities: string | string[]): boolean {
  const normalizedAuthorities = new Set(normalizeAuthorities(authorities));
  const requiredAuthorities = Array.isArray(expectedAuthorities) ? expectedAuthorities : [expectedAuthorities];

  return requiredAuthorities.some(requiredAuthority => normalizedAuthorities.has(normalizeAuthority(requiredAuthority)));
}
