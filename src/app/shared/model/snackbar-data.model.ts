export interface SnackbarData {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}
