import { Routes } from '@angular/router';
import { CertificationsPage } from './certifications-page.component' // Importa o componente principal da página

export const CERTIFICATIONS_ROUTES: Routes = [
  {
    path: '', // Rota padrão para /app/users
    component: CertificationsPage
    // Não precisa de guardas aqui se a rota pai (/app/users) já tem
  },
  // Adicione rotas filhas específicas de usuários se necessário (ex: /app/users/new)
];
