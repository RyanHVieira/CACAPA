export interface RegisterDTO {
  name: string;
  password: string;
}

export interface LoginDTO {
  name: string;
  password: string;
}

export interface AuthResponseDTO {
  id?: string;
  token: string;
  name: string;
  email: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  token: string;
}