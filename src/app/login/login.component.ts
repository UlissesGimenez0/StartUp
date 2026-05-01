import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  router = inject(Router);
  api    = inject(ApiService);

  user = { email: '', senha: '' };
  loginValid = true;
  carregando = false;

  // Role controlada diretamente aqui — sem depender do localStorage
  role: 'CANDIDATO' | 'EMPREGADOR' = 'CANDIDATO';

  login() {
    this.carregando = true;

    console.log('Enviando login com role:', this.role); // confirma no console

    this.api.login(this.user.email, this.user.senha, this.role).subscribe({
      next: ({ id }) => {
        this.loginValid = true;
        this.carregando = false;

        localStorage.setItem('loggedInUser', JSON.stringify({
          id,
          email: this.user.email,
          nome:  this.user.email.split('@')[0],
          role:  this.role
        }));

        if (this.role === 'EMPREGADOR') {
          this.router.navigate(['/dashboard-empregador']);
        } else {
          this.router.navigate(['/dashboard-empregado']); 
        }
      },
      error: () => {
        this.loginValid = false;
        this.carregando = false;
      }
    });
  }
}