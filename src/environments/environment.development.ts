export const environment = {
  production: false,
  // apiUrl: 'http://localhost:8080',
  apiUrl: (window as any).__env?.apiUrl || 'http://localhost:8080'
};
