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

  this.api.login(this.user.email, this.user.senha, this.role).subscribe({
    next: (response) => {
      this.loginValid = true;
      this.carregando = false;

      if (response.perfil === 'EMPREGADOR') {
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