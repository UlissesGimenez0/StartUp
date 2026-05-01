import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class FormValidator {
  /** Permite apenas letras e espaços */
  static apenasLetras(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return null;
      return /^[A-Za-zÀ-ÿ\s]+$/.test(value)
        ? null
        : { apenasLetras: 'Use apenas letras e espaços.' };
    };
  }

  /** Valida e-mail com formato padrão */
  static emailValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value)
        ? null
        : { emailValido: 'E-mail inválido.' };
    };
  }

  /** Senha forte (mínimo 6 caracteres, 1 letra e 1 número) */
  static senhaForte(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value)
        ? null
        : { senhaForte: 'A senha deve ter pelo menos 6 caracteres, incluindo letras e números.' };
    };
  }

  /** CPF válido (somente números ou formatado) */
  static cpfValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cpf = control.value?.replace(/\D/g, '');
      if (!cpf || cpf.length !== 11) return { cpfValido: 'CPF inválido.' };

      // Validação matemática de CPF
      let soma = 0;
      let resto;
      if (/^(\d)\1+$/.test(cpf)) return { cpfValido: 'CPF inválido.' };

      for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9])) return { cpfValido: 'CPF inválido.' };

      soma = 0;
      for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[10])) return { cpfValido: 'CPF inválido.' };

      return null;
    };
  }

  static apenasNumeros(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return /^[0-9]+$/.test(value)
        ? null
        : { apenasNumeros: 'Use apenas números.' };
    };
  }


  /** Apenas uma função (empregado OU empregador) */
  static somenteUmSelecionado(campo1: string, campo2: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const v1 = formGroup.get(campo1)?.value;
      const v2 = formGroup.get(campo2)?.value;
      return (v1 && v2) || (!v1 && !v2)
        ? { somenteUmSelecionado: 'Selecione apenas uma função.' }
        : null;
    };
  }

  /** Confirmar senha */
  static confirmarSenha(campoSenha: string, campoConfirmar: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const senha = formGroup.get(campoSenha)?.value;
      const confirmar = formGroup.get(campoConfirmar)?.value;
      return senha === confirmar ? null : { confirmarSenha: 'As senhas não coincidem.' };
    };
  }
}
