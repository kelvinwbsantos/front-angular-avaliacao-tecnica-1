# Aplicação Frontend - Avaliação Técnica

Este repositório contém o código-fonte aplicação em **Angular** que serve como a interface de usuário da aplicação.

## 🚀 Como Executar o Projeto

Esta aplicação foi projetada para ser executada como parte de um ambiente Docker Compose, que gerencia a comunicação com a API de backend. Para subir a aplicação completa, por favor, siga as instruções no repositório de orquestração principal.

**➡️ [Link para o Repositório de Orquestração](https://github.com/kelvinwbsantos/avaliacao-tecnica.git)**


README - Arquitetura do Projeto

🏛️ Arquitetura do Projeto (Feature-Based / Domínios)

Nossa arquitetura é baseada em "Features" (ou Domínios), onde cada grande "parte" do sistema é um mini-aplicativo independente.

A estrutura segue a metáfora de uma cidade:

/core (A Prefeitura): Infraestrutura global, única, que serve a todos.

/features (Os Bairros): Os domínios de negócio (Ex: Usuários, Certificações).

/shared (A Praça Central): Componentes 100% genéricos e reutilizáveis (Ex: um botão Ok/Cancel).

/layouts (O Prédio): A "casca" principal da aplicação (menu lateral, header).

```bash
src/app/
├── core/               # 🏛️ A PREFEITURA (Lógica ÚNICA)
│   ├── guards/         # (Seguranças: AuthGuard, PermissionGuard)
│   ├── interceptors/   # (Pedágio: TokenInterceptor)
│   └── services/       # (Infraestrutura: AuthService, LayoutService)
│
├── features/           # 🚀 OS BAIRROS (Domínios de Negócio)
│   │
│   ├── certifications/   # <-- Domínio "Certificações"
│   │   ├── components/   # (Garçons SÓ desta feature)
│   │   │   ├── certification-grid-modern/
│   │   │   ├── certification-grid-classic/
│   │   │   ├── certification-list/         (Tabela do Admin)
│   │   │   ├── certification-details/      (Modal de Edição)
│   │   │   ├── ai-question-generator/
│   │   │   └── ...
│   │   ├── pages/        # (Os "Pratos" / "Chefs" da Rota)
│   │   │   ├── certifications-admin-page/
│   │   │   ├── certifications-available-page/
│   │   │   ├── certifications-take-page/
│   │   │   └── ...
│   │   └── services/     # (Cozinheiros SÓ desta feature)
│   │       ├── certifications.service.ts
│   │       ├── exam.service.ts
│   │       ├── certificate.service.ts
│   │       ├── enrollment.service.ts
│   │       ├── question.service.ts
│   │       └── ... 
│   │       
│   ├── users/            # <-- Domínio "Usuários"
│   │   ├── components/   # (Ex: user-details-modal)
│   │   │   ├── user-details/
│   │   │   ├── user-certificates-list/
│   │   │   ├── user-exams-list/
│   │   │   └── ...
│   │   ├── pages/        
│   │   │   ├── users-admin-page/
│   │   │   ├── profile-page/
│   │   │   ├── achievements-page/  (A "Conquistas" mora aqui!)
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   └── user-routes/
│   │
│   ├── shared/           # <-- Domínio "Conteúdo Compartilhado"
│   │   ├── components/   # (Ex: content-shared.component.ts)
│   │   ├── services/     # (Ex: content-shared.service.ts)
│   │   └── models/
│   │        ├── certification.model.ts
│   │        ├── exam.model.ts
│   │        ├── certificate.model.ts
│   │        ├── enrollment.model.ts
│   │        ├── question.model.ts
│   │        ├── users.model.ts
│   │        ├── product.model.ts # <-- Modelo Exemplo "WordPress/WooCommerce"
│   │        └── ...
│   │  
│   └── new_feature/      # <-- Domínio de Exemplo "WordPress/WooCommerce" (FUTURO)
│       ├── components/   # (product-card, cart-icon)
│       ├── pages/        # (shop-page, product-detail-page)
│       └── services/     # (woocommerce.service.ts)
│
├── layouts/            # 🏢 O PRÉDIO (A casca da App)
│   ├── main-layout/
│   ├── header/
│   └── side-nav/
│
└── shared/             # 🏭 A PRAÇA CENTRAL (100% Genérico)
    ├── components/     # (Ex: <app-spinner>, <app-confirm-dialog>)
    ├── directives/     # (Ex: um 'click-outside.directive.ts')
    ├── pipes/          # (Ex: um 'truncate.pipe.ts')
    └── ...             
```

O "Bugre" do Acoplamento (Ex: Usuário e Exames)

P: "Mas a realização de um Exame (feature: certifications) não requer um Usuário (feature: users)? Isso não 'quebra' a independência?"

R: Excelente observação. A realização de um exame não requer o UserService (o "Cozinheiro" que gerencia a lista de usuários). Ela requer apenas o ID do usuário logado.

Essa informação (o usuário logado) não pertence a nenhum "Bairro" (feature). Ela pertence à "Prefeitura" (core/).

O AuthService (na "Prefeitura") é a Fonte Única da Verdade sobre o usuário logado.

O Fluxo Correto de Acoplamento (Saudável):

O AuthService (Prefeitura) guarda o usuário:

// src/app/core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Usamos um signal para guardar o usuário logado
  public currentUser = signal<User | null>(null);
  public userId = computed(() => this.currentUser()?.id);

  // ... (lógica de login/logout que preenche o signal)
}


O ExamService (Bairro) injeta o AuthService (Prefeitura):

// src/app/features/certifications/services/exam.service.ts
@Injectable({ providedIn: 'root' })
export class ExamService {

  private http = inject(HttpClient);
  // 1. O "Bairro" (ExamService) injeta a "Prefeitura" (AuthService)
  private authService = inject(AuthService); 

  // 2. O `startExam` NÃO precisa receber o 'userId'.
  //    Ele já sabe quem é o usuário!
  startExam(enrollmentId: string): Observable<Exam> {

    // 3. Ele pega o ID direto da Fonte da Verdade (a Prefeitura)
    const currentUserId = this.authService.userId(); 

    // (Lógica de segurança)
    if (!currentUserId) {
      return throwError(() => new Error('Usuário não autenticado.'));
    }

    // 4. Ele faz a chamada para a API
    const payload = { enrollmentId, userId: currentUserId };
    return this.http.post<Exam>(`${BASE_PATH}`, payload);
  }
}


Conclusão: O "acoplamento" acontece, mas é um acoplamento saudável Feature -> Core. Os "Bairros" (features/) podem (e devem) depender da "Prefeitura" (core/), mas eles nunca devem depender uns dos outros.

---
