import { useState, type FormEvent } from 'react';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Alert, Box, Button, Card, CardContent, Tab, Tabs, TextField, Typography } from '@mui/material';
import type { MockUser } from '../data/auth';
// import type { MockUser } from './auth';

type AuthMode = 'login' | 'register';

type LoginPageProps = {
  users: MockUser[];
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (user: MockUser) => void;
};

export function LoginPage({ users, onLogin, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'login') {
      const isAuthenticated = await onLogin(normalizedEmail, password);
      if (!isAuthenticated) {
        setError('Correo o contraseña incorrectos.');
      }
      return;
    }

    if (!name.trim() || !normalizedEmail || !password) {
      setError('Completa todos los campos para crear tu cuenta.');
      return;
    }
    if (users.some((candidate) => candidate.email === normalizedEmail)) {
      setError('Ya existe una cuenta registrada con este correo.');
      return;
    }
    onRegister({ id: `mock-user-${Date.now()}`, name: name.trim(), email: normalizedEmail, password, role: 'normal' });
  };

  return (
    <Box sx={{ alignItems: 'center', bgcolor: 'grey.100', display: 'flex', justifyContent: 'center', minHeight: '100vh', p: 2 }}>
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography component="h1" variant="h4" align='center'>Plataforma de gestión de canchas</Typography>
          <Tabs aria-label="Autenticación" onChange={(_, value: AuthMode) => { setMode(value); resetForm(); }} sx={{ mb: 3 }} value={mode} variant="fullWidth">
            <Tab label="Iniciar sesión" value="login" />
            <Tab label="Registrarse" value="register" />
          </Tabs>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            {mode === 'register' && <TextField autoComplete="name" fullWidth label="Nombre completo" margin="normal" onChange={(event) => setName(event.target.value)} required value={name} />}
            <TextField autoComplete="email" fullWidth label="Correo electrónico" margin="normal" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            <TextField autoComplete={mode === 'login' ? 'current-password' : 'new-password'} fullWidth label="Contraseña" margin="normal" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button fullWidth startIcon={mode === 'login' ? <LoginOutlinedIcon /> : <PersonAddOutlinedIcon />} sx={{ mt: 3 }} type="submit" variant="contained">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </Box>
          {mode === 'login' && <Alert severity="info" sx={{ mt: 3 }}>Pruebas: usuario@demo.com / 123456 · admin@demo.com / 123456</Alert>}
        </CardContent>
      </Card>
    </Box>
  );
}
