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
// --- Interface para Payload JWT (Usada pelo AuthService) ---
export interface JwtPayload {
    sub: string; // User ID (geralmente string UUID ou número como string)
    name: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
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
  isActive?: boolean;
  role?: { id: number, name: string };
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

// --- Interface para Dados do Usuário no LocalStorage/Componentes ---
export interface UserData {
    id: string;         // Do token 'sub'
    email: string;      // Do token 'email'
    name: string;       // <- MUDANÇA: Usar 'name' como principal (do token 'name')
    role: string;       // Do token 'role'
    // Tornar estes opcionais, pois não vêm diretamente do token
    firstName?: string;
    lastName?: string;
    // Manter outros campos opcionais que podem vir do perfil completo
    profilePictureUrl?: string;
    phone?: string;
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    uf?: string;
}

// Garanta que FullUserResponse TENHA a propriedade 'name'
export interface FullUserResponse {
  id: string; // ID do usuário como string
  name: string; //  Nome completo do usuário
  email: string;
  cpf?: string; // CPF pode ser opcional dependendo da API
  phonenumber?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  profilePictureUrl?: string; 
  role: string;
}