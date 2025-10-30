import { inject } from '@angular/core';
import { 
  CanActivateFn, 
  Router, 
  ActivatedRouteSnapshot, // Precisamos disso para ler os 'data'
  UrlTree 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Pergunta 1: O usuário está logado?
  if (!authService.isLoggedIn()) {
    // Não. Manda para o login.
    return router.createUrlTree(['/login']);
  }

  // Pergunta 2: Esta rota exige uma permissão (pulseira VIP)?
  // (Nós vamos definir isso no arquivo de rotas)
  const requiredPermission = route.data['permission'] as string;

  if (requiredPermission) {
    // Sim, exige. O usuário TEM essa permissão?
    if (!authService.hasPermission(requiredPermission)) {
      // Não. Manda ele para a tela de "Não Autorizado".
      // (É uma UX muito melhor do que jogar ele para a Home).
      return router.createUrlTree(['/unauthorized']); 
    }
  }

  // Se chegou até aqui, o usuário está logado E (se necessário) tem a permissão.
  // Pode entrar.
  return true;
};