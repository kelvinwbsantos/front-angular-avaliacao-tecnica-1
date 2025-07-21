import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-jobs',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss'
})
export class Jobs {
    vagas = [
    {
      titulo: 'Desenvolvedor Angular',
      localizacao: 'Maceió, AL',
      descricao: 'Experiência com Angular 20+, TypeScript e integração com APIs REST.'
    },
    {
      titulo: 'Analista de Sistemas',
      localizacao: 'Remoto',
      descricao: 'Atuação com análise de requisitos e desenvolvimento front-end com Angular Material.'
    },
  ];

}
