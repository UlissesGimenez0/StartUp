import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule }     from '@angular/material/card';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';
import { FormsModule }       from '@angular/forms';
import { MatInputModule }    from '@angular/material/input';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatListModule }     from '@angular/material/list';

import { ApiService, CandidatoAPI, VagaAPI } from '../../api.service';

@Component({
  selector: 'app-empregado-perfil',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatListModule
  ],
  templateUrl: './empregado-perfil.component.html',
  styleUrls: ['./empregado-perfil.component.scss']
})
export class EmpregadoPerfilComponent implements OnInit, OnDestroy {

  empregado:     CandidatoAPI | undefined;
  vagasAplicadas: VagaAPI[]   = [];
  modoEdicao     = false;
  carregando     = false;
  erro           = '';

  descricaoEditavel   = '';
  experienciaEditavel = '';

  isOwner = false;
  private usuarioLogado: any;
  private destroy$ = new Subject<void>();

  constructor(
    private route:    ActivatedRoute,
    private api:      ApiService,
    private location: Location
  ) {
    const raw = localStorage.getItem('loggedInUser');
    if (raw) this.usuarioLogado = JSON.parse(raw);
  }

  ngOnInit(): void {
    this.carregarPerfil();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carregar dados ────────────────────────────────────────────────────────

  private carregarPerfil(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.carregando = true;

    // Busca perfil do candidato
    this.api.buscarCandidato(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (candidato) => {
          this.empregado = candidato;
          this.isOwner   = this.usuarioLogado?.id === candidato.id;
          this.carregando = false;
          this.carregarVagasAplicadas(id);
        },
        error: () => {
          this.erro       = 'Não foi possível carregar o perfil.';
          this.carregando = false;
        }
      });
  }

  private carregarVagasAplicadas(id: number): void {
    this.api.listarVagasAplicadas(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (vagas) => this.vagasAplicadas = vagas,
        error: () => this.vagasAplicadas = []
      });
  }

  // ── Edição ────────────────────────────────────────────────────────────────

  entrarModoEdicao(): void {
    if (!this.empregado) return;
    this.descricaoEditavel   = this.empregado.descricao   ?? '';
    this.experienciaEditavel = this.empregado.experiencia ?? '';
    this.modoEdicao = true;
  }

  salvarAlteracoes(): void {
    if (!this.empregado?.id) return;

    this.api.atualizarCandidato(this.empregado.id, {
      descricao:   this.descricaoEditavel,
      experiencia: this.experienciaEditavel
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (atualizado) => {
        this.empregado  = atualizado;
        this.modoEdicao = false;
      },
      error: () => alert('Erro ao salvar alterações.')
    });
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
  }

  // ── Status da vaga aplicada ───────────────────────────────────────────────

  getStatusVaga(vaga: VagaAPI): string {
    if (vaga.status === 'ABERTA') return 'Aguardando resultado';
    if (vaga.candidatoSelecionadoId === this.empregado?.id) return '✅ Selecionado!';
    return '❌ Vaga preenchida';
  }

  voltar(): void {
    this.location.back();
  }
}