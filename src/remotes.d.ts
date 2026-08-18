declare module 'reservas/App' {
  import { ComponentType } from 'react';
  import { AuthContext } from './data/auth';

  const App: ComponentType<{ auth?: AuthContext }>;

  export default App;
}

declare module 'administracion/App' {
  import { ComponentType } from 'react';
  import { AuthContext } from './data/auth';

  const App: ComponentType<{ auth?: AuthContext }>;

  export default App;
}

declare module 'reportes/App' {
  import { ComponentType } from 'react';
  import { AuthContext } from './data/auth';

  const App: ComponentType<{ auth?: AuthContext }>;

  export default App;
}
