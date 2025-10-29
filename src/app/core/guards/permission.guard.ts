// Caminho: src/app/core/guards/permission.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajuste o caminho
import { Observable, map, of, tap } from 'rxjs'; // Import map, of, tap

export const PermissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  // 1. O authGuard já deve ter rodado antes, mas checamos por segurança
  if (!authService.isLoggedIn()) {
    console.warn('[PermissionGuard] Usuário não logado. Redirecionando para /login.');
    // Guarda a URL que o usuário tentou acessar para redirecionar após login
    const returnUrl = state.url;
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  // 2. Se a rota não exige permissões, libera geral!
  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.log('[PermissionGuard] Nenhuma permissão específica exigida. Acesso permitido.');
    return true;
  }

  // 3. Verifica se o usuário tem TODAS as permissões necessárias
  // Usamos um Observable aqui caso as permissões sejam carregadas assincronamente no futuro
  // Por enquanto, o mock as torna síncronas, mas a estrutura fica pronta.
  return of(requiredPermissions.every(perm => authService.hasPermission(perm))).pipe(
    tap(hasAllPermissions => {
      if (!hasAllPermissions) {
        console.warn(`[PermissionGuard] Acesso negado. Permissões exigidas: ${requiredPermissions.join(', ')}.`);
        // Redireciona para uma página específica de "Não Autorizado"
        router.navigate(['/unauthorized']); // <-- CRIAR ESTA ROTA/PÁGINA!
      } else {
        console.log(`[PermissionGuard] Acesso permitido. Permissões OK: ${requiredPermissions.join(', ')}`);
      }
    })
    // O map não é estritamente necessário se 'of' já emite boolean, mas garante o tipo
    // map(hasAllPermissions => hasAllPermissions)
  );

  /* // Versão Síncrona (se permissões SEMPRE estiverem prontas)
  const hasAllPermissions = requiredPermissions.every(perm => authService.hasPermission(perm));
  if (hasAllPermissions) {
      console.log(`[PermissionGuard] Acesso permitido. Permissões OK: ${requiredPermissions.join(', ')}`);
      return true;
  } else {
      console.warn(`[PermissionGuard] Acesso negado...`);
      router.navigate(['/unauthorized']);
      return false;
  }
  */
};