import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  constructor(private router: Router) {}

  roles = {
    empregado: false,
    empregador: false
  };

  // Objeto para receber os dados digitados pelo usuário
  novoUsuario = {
    nome: '',
    email: '',
    senha: ''
  };

  onRegister() {
    if (this.roles.empregado && this.roles.empregador) {
      alert('Você só pode escolher uma role.');
      return;
    }

    if (!this.roles.empregado && !this.roles.empregador) {
      alert('Por favor selecione uma role.');
      return;
    }

    // Salvar usuário no localStorage
    localStorage.setItem('loggedInUser', JSON.stringify(this.novoUsuario));
    const selectedRole = this.roles.empregado ? 'empregado' : 'empregador';
    localStorage.setItem('userRole', selectedRole);

    alert(`${selectedRole === 'empregador' ? 'Empregador' : 'Empregado'} registrado com sucesso!`);

    // Redirecionar para a tela de login
    this.router.navigate(['/login']);
  }
}
