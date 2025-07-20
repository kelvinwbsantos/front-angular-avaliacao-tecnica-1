import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginForm } from "./login-form/login-form";

@Component({
  selector: 'app-login-page',
  imports: [RouterOutlet, LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {

}
