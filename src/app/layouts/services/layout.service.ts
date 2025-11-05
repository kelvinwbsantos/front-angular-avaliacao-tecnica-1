import { Injectable, signal } from '@angular/core';

export type CertificationLayout = 'moderno' | 'classico'; // Nomes novos

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly STORAGE_KEY = 'app_cert_layout';
  
  public layout = signal<CertificationLayout>(this.getInitialLayout());

  private getInitialLayout(): CertificationLayout {
    // Padrão agora é o "moderno" (adesivo)
    return (localStorage.getItem(this.STORAGE_KEY) as CertificationLayout) || 'moderno';
  }

  public setLayout(newLayout: CertificationLayout): void {
    localStorage.setItem(this.STORAGE_KEY, newLayout);
    this.layout.set(newLayout);
  }

  public toggleLayout(): void {
    const nextLayout = this.layout() === 'moderno' ? 'classico' : 'moderno';
    this.setLayout(nextLayout);
  }
}