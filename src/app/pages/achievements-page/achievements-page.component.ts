// src/app/pages/achievements-page/achievements-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Importe o "recheio"
// (Assumindo que você moveu o user-exams para a pasta que sugeri)
import { UserExamsComponent } from '../../shared/components/user-exams/user-exams.component';

@Component({
  selector: 'app-achievements-page',
  standalone: true,
  imports: [
    CommonModule, 
    UserExamsComponent // 2. Coloque o "recheio" nos imports
  ],
  templateUrl: './achievements-page.component.html',
  styleUrls: ['./achievements-page.component.scss']
})
export class AchievementsPageComponent {
  // Esta página é burra. Ela não faz nada.
}