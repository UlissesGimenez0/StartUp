import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../storage.service';
import { Empregado } from '../../Model/empregado.type';
import { Vaga } from '../../Model/vaga.type'; // <-- 1. IMPORTE A INTERFACE Vaga

// Importações do Angular Material e FormsModule
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list'; // <-- 2. IMPORTE O MatListModule

@Component({
  selector: 'app-empregado-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule // <-- 3. ADICIONE AOS IMPORTS
  ],
  templateUrl: './empregado-perfil.component.html',
  styleUrls: ['./empregado-perfil.component.scss']
})
export class EmpregadoPerfilComponent implements OnInit {

  empregado: Empregado | undefined;
  vagasAplicadas: Vaga[] = []; // <-- 4. CRIE A PROPRIEDADE
  modoEdicao = false;

  descricaoEditavel = '';
  experienciaEditavel = '';

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.empregado = this.storageService.getEmpregadoById(id);
      // <-- 5. BUSQUE AS VAGAS APLICADAS
      if (this.empregado) {
        this.vagasAplicadas = this.storageService.getVagasAplicadas(this.empregado.id);
      }
    }
  }

  entrarModoEdicao(): void {
    if (this.empregado) {
      this.descricaoEditavel = this.empregado.descricao || '';
      this.experienciaEditavel = this.empregado.experiencia || '';
      this.modoEdicao = true;
    }
  }

  salvarAlteracoes(): void {
    if (this.empregado) {
      this.empregado.descricao = this.descricaoEditavel;
      this.empregado.experiencia = this.experienciaEditavel;
      this.storageService.salvarEmpregado(this.empregado);
      this.modoEdicao = false;
    }
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
  }

  voltar(): void {
    this.location.back();
  }
}
