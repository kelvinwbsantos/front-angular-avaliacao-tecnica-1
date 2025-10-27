// Caminho: src/app/pages/users-page/models/user-models.ts (ou onde preferir)
// v1.0 - Centraliza as interfaces de Usuário e Registro
export interface JwtPayload {
  sub: string; // User ID
  name: string;
  email: string;
  role: string;
  // iat?: number; // Issued at
  // exp?: number; // Expiration time
}

// Interface para os dados do usuário armazenados localmente
export interface UserData {
    id: string;
    email: string;
    nome: string;
    role: string;
}

// --- Interfaces para API de Listagem/Filtro ---
export interface UserApiParams {
  page: number;
  limit: number;
  name?: string | null;
  email?: string | null;
  cpf?: string | null;
}

export interface UserApiResponse {
  data: User[];
  total: number;
}

// --- Interface Básica do Usuário (Listagem) ---
export interface User {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  role: string;
}

// --- Interface Completa do Usuário (Detalhes) ---
export interface FullUserResponse {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phonenumber?: string;
  cep?: string;
  uf?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  role: string;
}

// --- Interface para Registro (Usada pelo AuthService) ---
export interface RegistrationData {
  token?: string; // Token pode ser de convite, opcional dependendo do fluxo
  cpf: string;
  name: string;
  email: string;
  phonenumber?: string;
  cep?: string;
  uf?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  password: string;
}

// --- Interface para Payload JWT (Usada pelo AuthService) ---
export interface JwtPayload {
    sub: string; // User ID (geralmente string UUID ou número como string)
    name: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

// --- Interface para Dados do Usuário no LocalStorage (Usada pelo AuthService) ---
export interface UserData {
    id: string;
    email: string;
    nome: string;
    role: string;
}