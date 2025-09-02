import { Component } from '@angular/core';
import { MenuNav } from './menu-nav/menu-nav';
import { About } from './about/about';
import { Jobs } from './jobs/jobs';
import { Contact } from "./contact/contact";
import { Footer } from "./footer/footer";
import { Carousel } from "./carousel/carousel";
import { Login } from "./login/login";

@Component({
  selector: 'app-landing-page',
  imports: [MenuNav, About, Jobs, Contact, Footer, Carousel, Login],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {
}
