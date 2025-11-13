import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../storage.service';
import { Empregado } from '../../Model/empregado.type';
import { Vaga } from '../../Model/vaga.type';
import { Subject, filter, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

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
    MatListModule
  ],
  templateUrl: './empregado-perfil.component.html',
  styleUrls: ['./empregado-perfil.component.scss']
})
export class EmpregadoPerfilComponent implements OnInit, OnDestroy {

  empregado: Empregado | undefined;
  vagasAplicadas: Vaga[] = [];
  modoEdicao = false;

  descricaoEditavel = '';
  experienciaEditavel = '';

  isOwner = false;
  private usuarioLogado: any;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private location: Location
  ) {
    const usuario = localStorage.getItem('loggedInUser');
    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
    }
  }

  ngOnInit(): void {
    this.carregarDadosDoPerfil();

    this.storageService.onDBUpdate$
      .pipe(
        filter(scope => scope === 'vagas' || scope === 'empregados'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('Perfil: DB atualizado, recarregando dados...');
        this.carregarDadosDoPerfil();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarDadosDoPerfil(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.empregado = this.storageService.getEmpregadoById(id);

      if (this.empregado) {
        this.vagasAplicadas = this.storageService.getVagasAplicadas(this.empregado.id);

        if (this.usuarioLogado && this.usuarioLogado.id === this.empregado.id) {
          this.isOwner = true;
        } else {
          this.isOwner = false;
        }
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
