import { Component } from '@angular/core';
import { MenuNav } from "../../components/landing-page/menu-nav/menu-nav";
import { About } from "../../components/landing-page/about/about";
import { Jobs } from "../../components/landing-page/jobs/jobs";

@Component({
  selector: 'app-landing-page',
  imports: [MenuNav, About, Jobs],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {

}
