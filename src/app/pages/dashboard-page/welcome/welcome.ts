import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome implements OnInit {
    nomeUsuario: string = '';
  
    ngOnInit(): void {
      const token = localStorage.getItem('auth_token');
  
      if (token) {
        try {
          const payload: JwtPayload = jwtDecode(token);
          
          this.nomeUsuario = payload.name || payload.sub || 'Usuário';
  
        } catch (e) {
          console.error('Erro ao decodificar o token JWT', e);
          this.nomeUsuario = 'Usuário';
        }
      } else {
        this.nomeUsuario = 'Usuário';
      }
    }
}
