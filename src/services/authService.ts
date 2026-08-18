import axios from 'axios';
import type { AuthContext, AuthUser, MockUser } from '../data/auth';

const toAuthUser = ({ password: _password, ...user }: MockUser): AuthUser => user;
const SESSION_STORAGE_KEY = 'gestion-canchas.auth.session';
const USERS_STORAGE_KEY = 'gestion-canchas.auth.users';
const authApi = axios.create({
  baseURL: '/api',
});

type ApiUserRole = 'ADMIN' | 'USUARIO_FINAL';

type LoginResponse = {
  token: string;
  userId: number;
  userName: string;
  userMail: string;
  userRole: ApiUserRole;
};

type RegisterResult = {
  success: boolean;
  message: string;
};

const isUserRole = (role: unknown): role is AuthUser['role'] => role === 'normal' || role === 'administrador';

const toUserRole = (role: ApiUserRole): AuthUser['role'] => (
  role === 'ADMIN' ? 'administrador' : 'normal'
);

const isLoginResponse = (value: unknown): value is LoginResponse => {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<LoginResponse>;
  return typeof response.token === 'string'
    && typeof response.userId === 'number'
    && typeof response.userName === 'string'
    && typeof response.userMail === 'string'
    && (response.userRole === 'ADMIN' || response.userRole === 'USUARIO_FINAL');
};

const getResponseMessage = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
    return value.message;
  }
  return fallback;
};

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

  getStoredSession(): AuthContext | null {
    const session = readStorage(SESSION_STORAGE_KEY, isAuthContext);
    return session;
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

  async login(email: string, password: string): Promise<AuthContext | null> {
    try {
      const { data } = await authApi.post<unknown>('/auth/login', {
        userMail: email,
        userPassword: password,
      });

      if (!isLoginResponse(data)) return null;

      return {
        token: data.token,
        user: {
          id: String(data.userId),
          name: data.userName,
          email: data.userMail,
          role: toUserRole(data.userRole),
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) return null;
      throw error;
    }
  },

  async register(name: string, email: string, password: string, role: ApiUserRole): Promise<RegisterResult> {
    try {
      const { data } = await authApi.post<unknown>('/auth/register', {
        userName: name,
        userMail: email,
        userPassword: password,
        userRole: role,
      });

      return {
        success: true,
        message: getResponseMessage(data, 'Usuario registrado correctamente.'),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: getResponseMessage(error.response?.data, 'No fue posible registrar el usuario.'),
        };
      }
      throw error;
    }
  },

  createSession(user: MockUser): AuthContext {
    return {
      token: `mock-jwt.${user.id}.${Date.now()}`,
      user: toAuthUser(user),
    };
  },
};
