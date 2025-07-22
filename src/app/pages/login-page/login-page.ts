import { Component } from '@angular/core';
import { LoginForm } from "./login-form/login-form";

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {

}
