export type User = {
  name: string;
  role?: string;
  email?: string;
  avatarUrl?: string | null;
};

// Single-user config — edit here to change sidebar display
export const currentUser: User = {
  name: 'Admin',
  role: 'Owner',
  email: undefined,
  avatarUrl: null,
};

export function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default currentUser;
