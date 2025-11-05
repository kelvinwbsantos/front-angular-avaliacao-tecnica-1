# Aplicação Frontend - Avaliação Técnica

Este repositório contém o código-fonte aplicação em **Angular** que serve como a interface de usuário da aplicação.

## 🚀 Como Executar o Projeto

Esta aplicação foi projetada para ser executada como parte de um ambiente Docker Compose, que gerencia a comunicação com a API de backend. Para subir a aplicação completa, por favor, siga as instruções no repositório de orquestração principal.

**➡️ [Link para o Repositório de Orquestração](https://github.com/kelvinwbsantos/avaliacao-tecnica.git)**

🏛️ Arquitetura do Projeto (A Metáfora da Cidade)

Para manter nosso código organizado e escalável, seguimos uma arquitetura baseada em "Separação de Responsabilidades". A maneira mais fácil de pensar nisso é como uma cidade:

    /core (A Prefeitura): A infraestrutura central. Coisas que a cidade inteira usa e que geralmente só existem uma vez.

    /pages (Os Bairros): Os destinos. São as "páginas" reais que o usuário visita, carregadas pelo roteador.

    /shared (As Lojas e Fábricas): Os recursos reutilizáveis. São os "Garçons" (componentes burros), as "Plantas" (modelos) e os "Cozinheiros" (serviços de API) que os "Bairros" usam.

### Estrutura de Pastas

```bash

src/app/
├── core/               # 🏛️ A PREFEITURA (Lógica Central do App)
│   ├── guards/         # (Seguranças: "Pode entrar?")
│   ├── interceptors/   # (Pedágio: "Deixa eu ver esse token.")
│   └── services/       # (Infraestrutura: AuthService, LayoutService)
│
├── pages/              # 🏠 OS BAIRROS (Os "Pratos" / "Chefs")
│   ├── certifications-admin/
│   ├── certifications-available/
│   ├── certifications-take/
│   ├── achievements/
│   ├── users-admin/
│   ├── profile/
│   └── ...
│
└── shared/             # 🏭 AS LOJAS E FÁBRICAS (Reutilizáveis)
    ├── components/     # (Os "Garçons" / "Comida")
    │   ├── certification-grid-modern/
    │   ├── certification-grid-classic/
    │   ├── user-exams/
    │   ├── user-details/
    │   └── ...
    │
    ├── models/         # (As "Plantas" / "Contratos")
    │   ├── certification.model.ts
    │   ├── user.model.ts
    │   ├── exam.model.ts
    │   ├── certificate.model.ts
    │   ├── enrollment.model.ts  
    │   └── ...
    │
    └── services/       # (Os "Cozinheiros" da API)
        ├── certifications.service.ts
        ├── user.service.ts
        ├── exam.service.ts
        ├── enrollment.service.ts
        └── ...

```


O Papel de Cada Um

    🏛️ /core (A Prefeitura)

    O que é? Coisas que rodam 1 vez e definem como o app funciona, não o que ele mostra. Regra: Se você apagar essa pasta, o app nem sobe.

        core/guards: Os seguranças. O auth.guard.ts que decide se o usuário (logado) pode ou não acessar uma rota.

        core/interceptors: O "pedágio". O token.interceptor.ts (por exemplo) que "pega" toda chamada para a API e anexa o token de autenticação.

        core/services: Serviços de infraestrutura. O AuthService (que guarda quem é o usuário) e o LayoutService (que guarda a preferência "Grid" vs "Lista") vivem aqui.

    🏠 /pages (Os Bairros)

    O que é? Os "Pratos" (ou "Chefs"). São os componentes "inteligentes" que o app.routes.ts carrega. Regra: Se tem uma URL, é uma "Page".

        Responsabilidade (O Chef): A única responsabilidade de uma "Page" é buscar os dados (chamar os serviços) e decidir qual "Comida" mostrar.

        Exemplo: O available-certifications-page.component.ts (nosso "Chef") busca as certificações na API e, baseado no LayoutService, decide se mostra o <app-certifications-grid-modern> ou o <app-certifications-grid-classic>. Ele que tem o isLoading = true e os .subscribe().

    🏭 /shared (As Lojas e Fábricas)

    O que é? O coração do reuso. São componentes e lógicas "burras" que podem ser usados em qualquer "Bairro" (Page). Regra: Um componente "shared" nunca busca seus próprios dados. Ele os recebe via @Input().

        shared/components/ (Os Garçons / "Comida"): Os componentes visuais. O certification-grid-modern.component é um "Garçom": ele não sabe como os dados chegaram, ele só recebe [certifications]="..." e os exibe. Se o usuário clica em algo, ele "toca um sininho" (@Output()).

        shared/models/ (As Plantas): Onde todas as interfaces (.model.ts) do projeto vivem. certification.model.ts, user.model.ts, etc. São os "contratos" que o Front e o Back concordam em usar.

        shared/services/ (Os Cozinheiros): Os serviços que falam com a API. CertificationsService, UserService, ExamService. Eles são os "cozinheiros" que sabem fazer os pedidos (GET, POST) para o backend.
---
