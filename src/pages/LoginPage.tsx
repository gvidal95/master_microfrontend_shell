import { useState, type FormEvent } from 'react';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Alert, Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material';

type AuthMode = 'login' | 'register';
type RegisterRole = 'ADMIN' | 'USUARIO_FINAL';

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string, role: RegisterRole) => Promise<{ success: boolean; message: string }>;
};

export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('USUARIO_FINAL');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setRole('USUARIO_FINAL'); setError(''); setMessage('');
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
    const result = await onRegister(name.trim(), normalizedEmail, password, role);
    if (!result.success) {
      setError(result.message);
      return;
    }

    setName('');
    setEmail('');
    setPassword('');
    setRole('USUARIO_FINAL');
    setMode('login');
    setMessage(result.message);
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
            {mode === 'register' && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="register-role-label">Rol de usuario</InputLabel>
                <Select
                  label="Rol de usuario"
                  labelId="register-role-label"
                  onChange={(event) => setRole(event.target.value as RegisterRole)}
                  value={role}
                >
                  <MenuItem value="USUARIO_FINAL">Cliente</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                </Select>
              </FormControl>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
            <Button fullWidth startIcon={mode === 'login' ? <LoginOutlinedIcon /> : <PersonAddOutlinedIcon />} sx={{ mt: 3 }} type="submit" variant="contained">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
