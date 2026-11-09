export interface RegisterDTO {
  name: string;
  password: string;
}

export interface LoginDTO {
  name: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  name: string;
  email: string;
}

export interface User {
  name: string;
  email: string;
  token: string;
}