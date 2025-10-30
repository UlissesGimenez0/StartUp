import { FormValidator } from './../validators/validators.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registerForm!: FormGroup;

  private readonly errorMessages: Record<string, string> = {
    required: 'Campo obrigatório.',
    minlength: 'Mínimo de 3 caracteres.',
    email: 'Formato de e-mail inválido.',
    apenasLetras: 'Use apenas letras e espaços.',
    apenasNumeros: 'Use apenas números.', // Adicionado
    emailValido: 'E-mail inválido.',
    senhaForte: 'A senha deve ter pelo menos 6 caracteres, incluindo letras, números e símbolos.',
    confirmarSenha: 'As senhas não coincidem.'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storageService: StorageService
  ) {
    this.criarFormulario();
  }

  criarFormulario() {
    this.registerForm = this.fb.group(
      {
        nome: ['', [Validators.required, Validators.minLength(3), FormValidator.apenasLetras()]],
        // --- ADICIONADOS ---
        idade: ['', [Validators.required, FormValidator.apenasNumeros()]],
        cidade: ['', [Validators.required, Validators.minLength(3)]],
        // -------------------
        email: ['', [Validators.required, Validators.email, FormValidator.emailValido()]],
        senha: ['', [Validators.required, FormValidator.senhaForte()]],
        confirmarSenha: ['', Validators.required],
        roles: this.fb.group(
          {
            empregado: [false],
            empregador: [false]
          },
          { validators: [FormValidator.somenteUmSelecionado('empregado', 'empregador')] }
        )
      },
      {
        validators: [FormValidator.confirmarSenha('senha', 'confirmarSenha')]
      }
    );
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.processarRegistro(this.registerForm.value);
  }

  private processarRegistro(formValue: any) {
    // --- ATUALIZADO ---
    const { nome, email, senha, roles, idade, cidade } = formValue;
    const selectedRole = roles.empregado ? 'empregado' : 'empregador';

    if (selectedRole === 'empregado') {
      const empregados = this.storageService.getEmpregados();
      const novoEmpregado = {
        id: empregados.length + 1,
        nome,
        email,
        senha,
        idade: +idade, // Converte para número
        cidade
      };
      this.storageService.salvarEmpregado(novoEmpregado);
    } else {
      const empregadores = this.storageService.getEmpregadores();
      const novoEmpregador = {
        id: empregadores.length + 1,
        nome,
        email,
        senha,
        idade: +idade, // Converte para número
        cidade
      };
      this.storageService.salvarEmpregador(novoEmpregador);
    }
    // -------------------

    alert(`Usuário registrado como ${selectedRole === 'empregador' ? 'Empregador' : 'Empregado'} com sucesso!`);
    this.router.navigate(['/login']);
  }

  getErrorMessage(campo: string): string | null {
    // ... (o resto do seu componente continua igual)
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
      const requiredLength = errorValue?.['requiredLength'] ?? 0;
      return `Mínimo de ${requiredLength} caracteres.`;
    }
    return this.errorMessages[errorKey] ?? 'Campo inválido.';
  }
}
