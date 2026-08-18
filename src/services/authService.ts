import type { AuthContext, AuthUser, MockUser } from '../data/auth';

const toAuthUser = ({ password: _password, ...user }: MockUser): AuthUser => user;

export const authService = {
  async login(email: string, password: string, users: MockUser[]): Promise<AuthContext | null> {
    // Sustituir esta búsqueda por POST /auth/login cuando el backend esté disponible.
    const user = users.find(
      (candidate) => candidate.email === email.toLowerCase() && candidate.password === password,
    );

    if (!user) return null;

    return {
      token: `mock-jwt.${user.id}.${Date.now()}`,
      user: toAuthUser(user),
    };
  },

  async getCurrentUser(token: string, users: MockUser[]): Promise<AuthUser | null> {
    // Sustituir por GET /auth/me con Authorization: Bearer ${token}.
    const [, userId] = token.split('.');
    const user = users.find((candidate) => candidate.id === userId);
    return user ? toAuthUser(user) : null;
  },

  createSession(user: MockUser): AuthContext {
    return {
      token: `mock-jwt.${user.id}.${Date.now()}`,
      user: toAuthUser(user),
    };
  },
};
