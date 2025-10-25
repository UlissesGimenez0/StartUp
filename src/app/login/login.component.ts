import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service'; // <-- 1. IMPORTE O SERVIÇO

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  router = inject(Router);
  storageService = inject(StorageService); // <-- 2. INJETE O SERVIÇO

  user = {
    email: '',
    senha: ''
  };

  loginValid: boolean = true;

  login() {
    // 3. USE O SERVIÇO PARA BUSCAR OS USUÁRIOS
    const empregados = this.storageService.getEmpregados();
    const empregadores = this.storageService.getEmpregadores();

    // Procura na lista de empregados
    let foundUser: any = empregados.find(
      u => u.email === this.user.email && u.senha === this.user.senha
    );

    let role = 'empregado';

    // Se não encontrou, procura na lista de empregadores
    if (!foundUser) {
      foundUser = empregadores.find(
        u => u.email === this.user.email && u.senha === this.user.senha
      );
      role = 'empregador';
    }

    if (foundUser) {
      this.loginValid = true;
      localStorage.setItem('loggedInUser', JSON.stringify({ ...foundUser, role }));

      if (role === 'empregado') {
        this.router.navigate(['/dashboard-empregado']);
      } else {
        this.router.navigate(['/dashboard-empregador']);
      }
    } else {
      this.loginValid = false;
    }
  }
}
