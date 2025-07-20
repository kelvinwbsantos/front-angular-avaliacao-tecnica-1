import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-menu-nav',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './menu-nav.html',
  styleUrl: './menu-nav.scss'
})
export class MenuNav {
  darkMode = false;
  
  ngOnInit() {
    const saved = localStorage.getItem('darkMode');
    this.darkMode = saved === 'true';
    this.updateHTMLClass();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.updateHTMLClass();
  }

  private updateHTMLClass() {
    if (this.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

}
