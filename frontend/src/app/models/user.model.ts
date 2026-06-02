export interface User {
  id: number;
  correo: string;
  rol: 'usuario' | 'admin';
}

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  correo: string;
}

export interface ResetPasswordPayload {
  correo: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface UserProfile extends User {}

export interface AccountUser extends User {}

export interface UpdateProfilePayload {
  correo?: string;
  currentPassword: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface OrderHistoryItem {
  id: number;
  total: number;
  detalles: string;
  fecha?: string;
  orden_paypal?: string;
  xml_cfdi?: string;
}
