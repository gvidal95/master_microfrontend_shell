import type { AuthContext, AuthUser, MockUser } from '../data/auth';

const toAuthUser = ({ password: _password, ...user }: MockUser): AuthUser => user;
const SESSION_STORAGE_KEY = 'gestion-canchas.auth.session';
const USERS_STORAGE_KEY = 'gestion-canchas.auth.users';

const isUserRole = (role: unknown): role is AuthUser['role'] => role === 'normal' || role === 'administrador';

const isMockUser = (value: unknown): value is MockUser => {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<MockUser>;
  return typeof user.id === 'string'
    && typeof user.name === 'string'
    && typeof user.email === 'string'
    && typeof user.password === 'string'
    && isUserRole(user.role);
};

const isAuthContext = (value: unknown): value is AuthContext => {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<AuthContext>;
  return typeof session.token === 'string'
    && !!session.user
    && typeof session.user.id === 'string'
    && typeof session.user.name === 'string'
    && typeof session.user.email === 'string'
    && isUserRole(session.user.role);
};

const readStorage = <T>(key: string, isValid: (value: unknown) => value is T): T | null => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    return isValid(value) ? value : null;
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // La aplicación continúa funcionando si el navegador bloquea localStorage.
  }
};

export const authService = {
  getStoredUsers(initialUsers: MockUser[]): MockUser[] {
    const users = readStorage(USERS_STORAGE_KEY, (value): value is MockUser[] => Array.isArray(value) && value.every(isMockUser));
    return users ?? initialUsers;
  },

  saveUsers(users: MockUser[]) {
    writeStorage(USERS_STORAGE_KEY, users);
  },

  getStoredSession(users: MockUser[]): AuthContext | null {
    const session = readStorage(SESSION_STORAGE_KEY, isAuthContext);
    if (!session) return null;

    const user = users.find((candidate) => candidate.id === session.user.id);
    if (!user || user.role !== session.user.role) {
      this.clearSession();
      return null;
    }

    return { token: session.token, user: toAuthUser(user) };
  },

  saveSession(session: AuthContext) {
    writeStorage(SESSION_STORAGE_KEY, session);
  },

  clearSession() {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // La sesión en memoria se eliminará igualmente desde la aplicación.
    }
  },

  async login(email: string, password: string, users: MockUser[]): Promise<AuthContext | null> {
    // TODO: Sustituir esta búsqueda por POST /auth/login cuando el backend esté disponible.
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
    //TODO: Sustituir por GET /auth/me con Authorization: Bearer ${token}.
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
