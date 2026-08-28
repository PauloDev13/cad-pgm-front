export const environment = {
  production: false,
  apiUrl: (window as any).__env?.apiUrl || 'http://localhost:8081',
  pythonApiBaseUrl: (window as any).__env?.pythonApiBaseUrl || '/python-api/v1'
};
