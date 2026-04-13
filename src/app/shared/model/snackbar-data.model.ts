export interface SnackbarData {
  type: 'success' | 'error' | 'warning';
  title?: string;
  message: string;
}
