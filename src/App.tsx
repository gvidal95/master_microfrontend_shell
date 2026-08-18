import { Component, lazy, Suspense, useMemo, useState, type ReactNode } from 'react';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { AppBar, Box, Button, CircularProgress, CssBaseline, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { initialMockUsers, type AuthContext, type MockUser, type UserRole } from './data/auth';
import { LoginPage } from './pages/LoginPage';
import { authService } from './services/authService';

const drawerWidth = 248;
const Reservas = lazy(() => import('reservas/App'));
const Administracion = lazy(() => import('administracion/App'));
const Reportes = lazy(() => import('reportes/App'));

type Microfrontend = 'reservas' | 'administracion' |
  'reportes';

const navigationItems: Array<{ id: Microfrontend; label: string; icon: ReactNode; allowedRoles: UserRole[] }> = [
  { id: 'reservas', label: 'Reservas', icon: <CalendarMonthOutlinedIcon />, allowedRoles: ['normal', 'administrador'] },
  { id: 'administracion', label: 'Administración', icon: <SettingsOutlinedIcon />, allowedRoles: ['administrador'] },
  { id: 'reportes', label: 'Reportes', icon: <AssessmentOutlinedIcon />, allowedRoles: ['administrador'] },
];

class RemoteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6">No fue posible cargar este módulo</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Verifica que el microfrontend esté disponible e inténtalo nuevamente.</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

function MicrofrontendContent({ activeModule, auth }: { activeModule: Microfrontend; auth: AuthContext }) {
  const RemoteApp = { reservas: Reservas, administracion: Administracion, reportes: Reportes }[activeModule];

  return (
    <RemoteErrorBoundary key={activeModule}>
      <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Cargando microfrontend" /></Box>}>
        <RemoteApp auth={auth} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function AppLayout({ auth, onLogout }: { auth: AuthContext; onLogout: () => void }) {
  const allowedItems = useMemo(() => navigationItems.filter((item) => item.allowedRoles.includes(auth.user.role)), [auth.user.role]);
  const [activeModule, setActiveModule] = useState<Microfrontend>('reservas');
  const activeItem = allowedItems.find((item) => item.id === activeModule) ?? allowedItems[0];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100', color: 'black' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography component="h1" variant="h6" noWrap sx={{ flexGrow: 1 }}>Plataforma de gestión</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>{auth.user.name}</Typography>
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutOutlinedIcon />}>Cerrar sesión</Button>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
        <Toolbar />
        <Divider />
        <List aria-label="Navegación de microfrontends">
          {allowedItems.map((item) => (
            <ListItemButton key={item.id} selected={activeItem.id === item.id} onClick={() => setActiveModule(item.id)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3 }}>
        <Toolbar />
        <Typography component="h2" variant="h4" sx={{ mb: 3 }}>{activeItem.label}</Typography>
        <MicrofrontendContent activeModule={activeItem.id} auth={auth} />
      </Box>
    </Box>
  );
}

function App() {
  const [users, setUsers] = useState<MockUser[]>(initialMockUsers);
  const [session, setSession] = useState<AuthContext | null>(null);

  const handleLogin = async (email: string, password: string) => {
    const auth = await authService.login(email, password, users);
    if (!auth) return false;

    setSession(auth);
    return true;
  };

  const handleRegister = (newUser: MockUser) => {
    setUsers((currentUsers) => [...currentUsers, newUser]);
    setSession(authService.createSession(newUser));
  };

  if (!session) return <LoginPage users={users} onLogin={handleLogin} onRegister={handleRegister} />;
  return <AppLayout auth={session} onLogout={() => setSession(null)} />;
}

export default App;
