import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-expired',
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './expired.html',
  styleUrl: './expired.scss'
})
export class Expired {
  
}
