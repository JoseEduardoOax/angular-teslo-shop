export type TokenStatus =
  | 'valid'
  | 'expired'
  | 'expiring_soon'
  | 'invalid'
  | 'refreshing'
  | 'not_found'
  | 'unauthorized';

// Interfaz para la respuesta del API
export interface TokenCheckResponse {
  status: TokenStatus;
  message?: string;
  expiresIn?: number; // Segundos hasta expiración
  requiresRefresh?: boolean;
}

// Interfaz completa para el estado del token
export interface TokenState {
  status: TokenStatus;
  lastCheck: Date;
  expiresAt?: Date;
  refreshToken?: string;
}
