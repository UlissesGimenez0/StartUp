import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewInit, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService, VagaAPI, CandidatoAPI } from '../api.service';
import { Empregador } from '../Model/empregador.type';

@Component({
  selector: 'app-empregador',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatListModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './empregador.component.html',
  styleUrl: './empregador.component.scss'
})
export class EmpregadorComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('enderecoInput') enderecoInputRef!: ElementRef;

  usuarioLogado!: Empregador & { role: string };

  vagasCriadas: VagaAPI[] = [];
  vagaSelecionada: VagaAPI | null = null;
  candidatosDaVaga: CandidatoAPI[] = [];

  // ── CORREÇÃO 1: adicionado nomeEmpresa ────────────────────────────────────
  novaVaga = {
    nomeEmpresa: '',
    titulo: '',
    descricao: '',
    endereco: '',
    tempoMedioEstimado: ''
  };

  posicaoSelecionada: { lat: number; lng: number } | null = null;
  carregando = false;
  erroVagas = '';
  mensagem = '';

  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('loggedInUser');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuarioLogado = JSON.parse(raw);
    // Preenche o nome da empresa com o nome do empregador logado
    this.novaVaga.nomeEmpresa = this.usuarioLogado.nome;
    this.carregarVagas();
  }

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined' && google.maps?.places) {
      const autocomplete = new google.maps.places.Autocomplete(
        this.enderecoInputRef.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        this.ngZone.run(() => {
          if (place.geometry?.location) {
            this.posicaoSelecionada = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
          }
          this.novaVaga.endereco = place.formatted_address ?? place.name ?? '';
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

carregarVagas(): void {
  this.carregando = true;
  this.erroVagas = '';
  
  this.api.listarVagas().pipe(takeUntil(this.destroy$)).subscribe({
    next: (vagas) => {
      // 1. LOG DE DEPURAÇÃO: Abra o console (F12) e veja o que está chegando
      console.log('ID do Logado:', this.usuarioLogado.id);
      console.log('Primeira vaga da API:', vagas[0]);

      // 2. FILTRO ROBUSTO
      this.vagasCriadas = vagas.filter(v => {
        // Extrai o ID do autor de várias formas possíveis (autor.id, autorId, empregador.id)
        const idDaVaga = v.autor?.id || (v as any).autorId || (v as any).empregador?.id;
        
        // Usamos == (dois iguais) para ignorar se é String ou Número
        return idDaVaga == this.usuarioLogado.id;
      });

      this.carregando = false;
    },
    error: (err) => {
      console.error('Erro na API:', err);
      this.erroVagas = 'Não foi possível carregar as vagas.';
      this.carregando = false;
    }
  });
}

  criarNovaVaga(): void {
    if (!this.novaVaga.titulo || !this.novaVaga.descricao || !this.novaVaga.endereco) {
      alert('Por favor, preencha Título, Descrição e Endereço.');
      return;
    }

    if (this.posicaoSelecionada) {
      // Autocomplete já deu a coordenada — publica direto
      this.publicarVaga();
    } else {
      // Tenta geocodificar o endereço digitado
      this.carregando = true;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: this.novaVaga.endereco }, (results, status) => {
        this.ngZone.run(() => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            this.posicaoSelecionada = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            };
            console.log('Geocoding ok:', this.posicaoSelecionada);
          } else {
            console.warn('Geocoding falhou, usando lat/lng = 0');
          }
          this.publicarVaga();
        });
      });
    }
  }

  private publicarVaga(): void {
    this.carregando = true;
    this.api.criarVaga({
      titulo: this.novaVaga.titulo,
      descricao: this.novaVaga.descricao,
      nomeEmpresa: this.usuarioLogado.nome,
      endereco: this.novaVaga.endereco,
      tempoMedioEstimado: this.novaVaga.tempoMedioEstimado,
      lat: this.posicaoSelecionada?.lat ?? 0,
      lng: this.posicaoSelecionada?.lng ?? 0,
      autorId: this.usuarioLogado.id
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (vagaCriada) => {
        this.vagasCriadas = [...this.vagasCriadas, vagaCriada];
        this.mensagem = `✅ Vaga "${vagaCriada.titulo}" criada com sucesso!`;
        this.limparFormulario();
        this.carregando = false;
        setTimeout(() => this.mensagem = '', 4000);
      },
      error: (error) => {
        console.error('Erro ao criar vaga:', error);
        console.error('Resposta do backend:', error.error);

        if (error.status === 400) {
          alert(error.error || 'Empregador não identificado. Faça login novamente.');
        } else if (error.status === 500) {
          alert('Erro no servidor ao criar vaga. Veja os logs do Render.');
        } else {
          alert('Erro ao criar vaga.');
        }

        this.carregando = false;
      }
    });
  }
  deletarVaga(vaga: VagaAPI, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Deseja remover a vaga "${vaga.titulo}"?`)) return;
    this.api.deletarVaga(vaga.id!).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.vagasCriadas = this.vagasCriadas.filter(v => v.id !== vaga.id);
        if (this.vagaSelecionada?.id === vaga.id) this.voltarParaLista();
      },
      error: () => alert('Erro ao remover a vaga.')
    });
  }

  verCandidatos(vaga: VagaAPI): void {
    this.vagaSelecionada = vaga;
    this.candidatosDaVaga = [];
    this.carregando = true;

    this.api.listarCandidatos(vaga.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (candidatos) => {
          this.candidatosDaVaga = candidatos;
          this.carregando = false;
        },
        error: () => {
          this.candidatosDaVaga = [];
          this.carregando = false;
        }
      });
  }
  voltarParaLista(): void {
    this.vagaSelecionada = null;
    this.candidatosDaVaga = [];
  }

  // ── CORREÇÃO 2: avaliarCandidato — por ora salva só localmente ────────────
  // (o backend ainda não tem endpoint de avaliação)
  avaliarCandidato(candidato: CandidatoAPI, nota: number): void {
    this.api.avaliarCandidato(candidato.id, nota)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Atualiza a avaliação localmente sem precisar recarregar tudo
          const novaMedia = candidato.avaliacao
            ? (candidato.avaliacao + nota) / 2
            : nota;

          this.candidatosDaVaga = this.candidatosDaVaga.map(c =>
            c.id === candidato.id ? { ...c, avaliacao: novaMedia } : c
          );

          alert(`⭐ Avaliação de ${nota} estrela(s) salva para ${candidato.nome}!`);
        },
        error: () => alert('Erro ao salvar avaliação.')
      });
  }

  selecionarCandidato(vaga: VagaAPI | null, candidato: CandidatoAPI): void {
    if (!vaga?.id) return;

    this.api.atualizarVaga(vaga.id, {
      titulo: vaga.titulo,
      descricao: vaga.descricao,
      endereco: vaga.endereco,
      status: 'PREENCHIDA',
      candidatoSelecionadoId: candidato.id
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (vagaAtualizada) => {
        // 1. Atualiza a vaga na lista
        this.vagasCriadas = this.vagasCriadas.map(v =>
          v.id === vagaAtualizada.id ? vagaAtualizada : v
        );
        // 2. Atualiza a vaga selecionada (reflete no template imediatamente)
        this.vagaSelecionada = vagaAtualizada;

        // 3. Marca visualmente o candidato selecionado na lista
        this.candidatosDaVaga = this.candidatosDaVaga.map(c => c);

        alert(`✅ ${candidato.nome} selecionado! A vaga foi marcada como Preenchida.`);
      },
      error: () => alert('Erro ao selecionar candidato.')
    });
  }

  // ── CORREÇÃO 4: helper de status para o template ──────────────────────────
  // O HTML compara com 'Aberta', mas o backend retorna 'ABERTA'
  vagaAberta(vaga: VagaAPI | null): boolean {
    return vaga?.status === 'ABERTA';
  }

  private limparFormulario(): void {
    this.novaVaga = {
      nomeEmpresa: this.usuarioLogado.nome,
      titulo: '',
      descricao: '',
      endereco: '',
      tempoMedioEstimado: ''
    };
    this.posicaoSelecionada = null;
  }

logout(): void {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  this.router.navigate(['/login']);
}
}