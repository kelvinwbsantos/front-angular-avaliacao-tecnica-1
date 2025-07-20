import { Component } from '@angular/core';
import { MenuNav } from './menu-nav/menu-nav';
import { About } from './about/about';
import { Jobs } from './jobs/jobs';
import { Contact } from "./contact/contact";

@Component({
  selector: 'app-landing-page',
  imports: [MenuNav, About, Jobs, Contact],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {

}
