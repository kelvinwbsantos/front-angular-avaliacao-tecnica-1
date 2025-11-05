// src/app/pages/achievements-page/achievements-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationsCardGridModernComponent } from '../certifications-page/components/certifications-card-grid-modern/certifications-card-grid-modern.component';


@Component({
  selector: 'app-available-certifications-page',
  standalone: true,
  imports: [
    CommonModule, 
    CertificationsCardGridModernComponent
  ],
  templateUrl: './available-certifications-page.component.html',
  styleUrls: ['./available-certifications-page.component.scss']
})
export class AvailableCertificationsPageComponent {
  // Esta página é burra. Ela não faz nada.
}