export type UserRole = 'normal' | 'administrador';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthContext = {
  token: string;
  user: AuthUser;
};

export type MockUser = AuthUser & { password: string };

export const initialMockUsers: MockUser[] = [
  { id: 'mock-user-1', name: 'Usuario demo', email: 'usuario@demo.com', password: '123456', role: 'normal' },
  { id: 'mock-admin-1', name: 'Administrador demo', email: 'admin@demo.com', password: '123456', role: 'administrador' },
];
