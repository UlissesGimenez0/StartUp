import { FormValidator } from './../validators/validators.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; // <-- troca o import

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registerForm!: FormGroup;
  carregando = false;

  private readonly errorMessages: Record<string, string> = {
    required:       'Campo obrigatório.',
    minlength:      'Mínimo de 3 caracteres.',
    email:          'Formato de e-mail inválido.',
    apenasLetras:   'Use apenas letras e espaços.',
    apenasNumeros:  'Use apenas números.',
    emailValido:    'E-mail inválido.',
    senhaForte:     'A senha deve ter pelo menos 6 caracteres, incluindo letras e números.',
    confirmarSenha: 'As senhas não coincidem.'
  };

  constructor(
    private fb:     FormBuilder,
    private router: Router,
    private api:    ApiService  // <-- troca o serviço
  ) {
    this.criarFormulario();
  }

  criarFormulario() {
    this.registerForm = this.fb.group(
      {
        nome:     ['', [Validators.required, Validators.minLength(3), FormValidator.apenasLetras()]],
        idade:    ['', [Validators.required, FormValidator.apenasNumeros()]],
        cidade:   ['', [Validators.required, Validators.minLength(3)]],
        telefone: ['', [Validators.required, FormValidator.apenasNumeros(), Validators.minLength(10), Validators.maxLength(11)]],
        email:    ['', [Validators.required, Validators.email, FormValidator.emailValido()]],
        senha:    ['', [Validators.required, FormValidator.senhaForte()]],
        confirmarSenha: ['', Validators.required],
        roles: this.fb.group(
          { empregado: [false], empregador: [false] },
          { validators: [FormValidator.somenteUmSelecionado('empregado', 'empregador')] }
        )
      },
      { validators: [FormValidator.confirmarSenha('senha', 'confirmarSenha')] }
    );
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.processarRegistro();
  }

  private processarRegistro() {
    const { nome, email, senha, roles, cidade, telefone, idade } = this.registerForm.value;
    const role: 'CANDIDATO' | 'EMPREGADOR' = roles.empregado ? 'CANDIDATO' : 'EMPREGADOR';

    this.carregando = true;

    this.api.registro({ nome, email, senha, role, cidade, telefone, idade: String(idade) }).subscribe({
      next: () => {
        this.carregando = false;
             localStorage.setItem('userRole', role.toLowerCase());
        alert(`Cadastro realizado como ${role === 'EMPREGADOR' ? 'Empregador' : 'Candidato'}!`);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.carregando = false;
        console.error('Erro ao registrar:', err);
        alert('Erro ao realizar cadastro. Tente novamente.');
      }
    });
  }

  getErrorMessage(campo: string): string | null {
    const control = this.registerForm.get(campo);
    if (!control || !control.touched) return null;
    if (campo === 'confirmarSenha' && this.registerForm.errors?.['confirmarSenha']) {
      return this.errorMessages['confirmarSenha'];
    }
    const errors = control.errors;
    if (!errors) return null;
    const errorKey = Object.keys(errors)[0];
    const errorValue = errors[errorKey];
    if (errorKey === 'minlength') {
      return `Mínimo de ${errorValue?.['requiredLength'] ?? 0} caracteres.`;
    }
    return this.errorMessages[errorKey] ?? 'Campo inválido.';
  }
}