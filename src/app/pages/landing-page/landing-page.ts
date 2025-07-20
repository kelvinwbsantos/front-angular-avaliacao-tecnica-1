import { Component } from '@angular/core';
import { MenuNav } from './menu-nav/menu-nav';
import { About } from './about/about';
import { Jobs } from './jobs/jobs';
import { Contact } from "./contact/contact";
import { Footer } from "./footer/footer";
import { Carousel } from "./carousel/carousel";

@Component({
  selector: 'app-landing-page',
  imports: [MenuNav, About, Jobs, Contact, Footer, Carousel],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {

}
