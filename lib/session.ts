import { SessionOptions } from 'iron-session';

export interface SessionData {
  user?: {
    user_id: number;
    username: string;
    email: string;
    role_name: string;
    access_level: number;
    dept_id: number;
  };
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'sintex-dashboard-super-secret-key-2024',
  cookieName: 'sintex_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
  },
};
