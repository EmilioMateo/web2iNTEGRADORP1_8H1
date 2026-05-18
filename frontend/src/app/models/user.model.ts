export interface User {
  id: number;
  username: string;
  rol: 'usuario' | 'trabajador';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  rol: 'usuario' | 'trabajador';
}

export interface LoginResponse {
  message: string;
  user: User;
}


