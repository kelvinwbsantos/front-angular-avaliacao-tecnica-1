import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-carousel',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss'
})
export class Carousel {
  currentSlide = 0;
  intervalId: any;

  slides = [
    {
      title: 'Inovação em Tecnologia',
      description: 'Soluções sob medida para sua empresa crescer com segurança.'
    },
    {
      title: 'Serviços de TI Especializados',
      description: 'Consultoria, suporte e desenvolvimento com qualidade e agilidade.'
    },
    {
      title: 'Equipe Multidisciplinar',
      description: 'Profissionais capacitados para atender às suas necessidades.'
    }
  ];

  ngOnInit() {
    this.intervalId = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }
}