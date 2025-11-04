// src/app/pages/achievements-page/achievements-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationsCardGridComponent } from '../certifications-page/components/certifications-card-grid/certifications-card-grid.component';


@Component({
  selector: 'app-available-certifications-page',
  standalone: true,
  imports: [
    CommonModule, 
    CertificationsCardGridComponent
  ],
  templateUrl: './available-certifications-page.component.html',
  styleUrls: ['./available-certifications-page.component.scss']
})
export class AvailableCertificationsPageComponent {
  // Esta página é burra. Ela não faz nada.
}