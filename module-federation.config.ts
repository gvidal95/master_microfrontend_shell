import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'shell',

  remotes: {
    reservas: 'reservas@http://localhost:3001/mf-manifest.json',
    administracion: 'administracion@http://localhost:3002/mf-manifest.json',
    reportes: 'reportes@http://localhost:3003/mf-manifest.json'
  },

  shared: {
    react: {
      singleton: true,
    },

    'react-dom': {
      singleton: true,
    },
  },
});