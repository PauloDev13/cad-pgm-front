import { jwtDecode } from 'jwt-decode';
import { IDecodedToken } from '../models/auth.model';

/**
 * Decodifica o payload do JWT com tratamento seguro contra strings corrompidas.
 */
export function decodeToken(token: string | null) {
  if (!token) return null;

  try {
    return jwtDecode<IDecodedToken>(token);
  } catch {
    return null;
  }
}

/**
 * Verifica se um JWT expirou.
 * @param token Token JWT em formato string
 * @param offsetSeconds Margem de tolerância em segundos para evitar race conditions (padrão: 10s)
 * @returns true se o token for nulo, inválido ou se já tiver ultrapassado a data de expiração.
 */
export function isTokenExpired(token: string | null, offsetSeconds: number = 10): boolean {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.exp) return true;

  const expirationDateMs = decoded.exp * 1000;
  const nowMs = Date.now();
  const offSetMs = offsetSeconds * 1000;

  return nowMs >= (expirationDateMs - offSetMs);
}
