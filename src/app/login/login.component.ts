import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  router = inject(Router);

  user = {
    email: '',
    senha: ''
  };

  loginValid: boolean = true;

  login() {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

    if (storedUser && this.user.email === storedUser.email && this.user.senha === storedUser.senha) {
      this.loginValid = true;

      const role = localStorage.getItem('userRole');
      if (role === 'empregado') {
        this.router.navigate(['/dashboard-empregado']);
      } else if (role === 'empregador') {
        this.router.navigate(['/dashboard-empregador']);
      }
    } else {
      this.loginValid = false;
    }
  }
}
