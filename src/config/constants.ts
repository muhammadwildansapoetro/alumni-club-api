export const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';
export const JWT_EXPIRES = '7d';

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
] as const;

export const AUTH_PROVIDERS = {
  EMAIL: 'EMAIL',
  GOOGLE: 'GOOGLE',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;