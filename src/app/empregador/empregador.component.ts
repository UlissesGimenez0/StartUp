import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../storage.service';
import { Vaga } from '../Model/vaga.type';
import { Empregador } from '../Model/empregador.type';
import { Empregado } from '../Model/empregado.type';
import { Subject, filter, takeUntil } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-empregador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    RouterLink
  ],
  templateUrl: './empregador.component.html',
  styleUrl: './empregador.component.scss'
})
export class EmpregadorComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('enderecoInput') enderecoInputRef!: ElementRef;

  usuarioLogado!: Empregador;
  vagasCriadas: Vaga[] = [];
  private destroy$ = new Subject<void>();

  vagaSelecionada: Vaga | null = null;
  candidatosDaVaga: Empregado[] = [];
  posicaoSelecionada: google.maps.LatLngLiteral | null = null;

  novaVaga: Omit<Vaga, 'id' | 'posicao' | 'candidatos' | 'autorId' | 'status' | 'candidatoSelecionadoId'> = {
    nomeEmpresa: '',
    titulo: '',
    descricao: '',
    endereco: '',
    tempoMedioEstimado: ''
  };

  constructor(
    private storage: StorageService,
    private router: Router,
    private ngZone: NgZone
  ) {
  }

  ngOnInit(): void {
    const usuario = localStorage.getItem('loggedInUser');
    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
      this.novaVaga.nomeEmpresa = this.usuarioLogado.nome;
    } else {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarVagas();

    // --- [INÍCIO DA CORREÇÃO] ---
    this.storage.onDBUpdate$
      .pipe(
        filter(scope => scope === 'vagas'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('Dashboard Empregador: Vagas atualizadas, recarregando...');

        // 1. Recarrega a lista de vagas (isto busca os novos contadores de candidatos)
        this.carregarVagas();

        // 2. Verifica se está na tela de detalhes
        if (this.vagaSelecionada) {

          // 3. Re-busca o objeto da vaga selecionada
          const vagaAtualizada = this.storage.getVagas().find(v => v.id === this.vagaSelecionada!.id) || null;

          this.vagaSelecionada = vagaAtualizada;

          // 4. SÓ atualiza a lista de candidatos se a vaga ainda existir
          if (this.vagaSelecionada) {
            this.candidatosDaVaga = this.storage.getCandidatos(this.vagaSelecionada.id);
          } else {
            // 5. Se a vaga foi deletada, limpa a lista e volta
            this.candidatosDaVaga = [];
            this.voltarParaLista();
          }
        }
      });
    // --- [FIM DA CORREÇÃO] ---
  }

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(
        this.enderecoInputRef.nativeElement
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        this.ngZone.run(() => {
          if (place.geometry && place.geometry.location) {
            this.posicaoSelecionada = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
          }
          this.novaVaga.endereco = place.formatted_address || place.name;
        });
      });
    } else {
      console.error("Google Maps Places API não foi carregada.");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarVagas(): void {
    const todasVagas = this.storage.getVagas();
    this.vagasCriadas = todasVagas.filter(vaga => vaga.autorId === this.usuarioLogado.id);
  }

  criarNovaVaga(): void {
    if (!this.novaVaga.titulo || !this.novaVaga.descricao || !this.novaVaga.endereco) {
      alert('Por favor, preencha Título, Descrição e Endereço.');
      return;
    }

    const vagaCompleta: Vaga = {
      ...this.novaVaga,
      id: new Date().getTime(),
      autorId: this.usuarioLogado.id,
      candidatos: [],
      posicao: this.posicaoSelecionada || this.gerarCoordenadaAleatoria({ lat: -23.5043, lng: -47.4582 }, 5),
      status: 'Aberta'
    };

    this.storage.adicionarVaga(vagaCompleta);
    alert('Vaga criada com sucesso!');

    this.novaVaga.titulo = '';
    this.novaVaga.descricao = '';
    this.novaVaga.endereco = '';
    this.novaVaga.tempoMedioEstimado = '';
    this.posicaoSelecionada = null;
  }

  verCandidatos(vaga: Vaga): void {
    this.vagaSelecionada = vaga;
    this.candidatosDaVaga = this.storage.getCandidatos(vaga.id);
  }

  voltarParaLista(): void {
    this.vagaSelecionada = null;
    this.candidatosDaVaga = [];
  }

  private gerarCoordenadaAleatoria(centro: google.maps.LatLngLiteral, raioKm: number): google.maps.LatLngLiteral {
    const raioEmGraus = raioKm / 111;
    const u = Math.random();
    const v = Math.random();
    const w = raioEmGraus * Math.sqrt(u);
    const t = 2 * Math.PI * v;

    return {
      lat: centro.lat + w * Math.cos(t),
      lng: centro.lng + (w * Math.sin(t)) / Math.cos((centro.lat * Math.PI) / 180)
    };
  }

  avaliarCandidato(candidato: Empregado, nota: number): void {
    if (candidato.id === this.usuarioLogado.id) {
      alert('Não pode avaliar-se a si mesmo.');
      return;
    }
    this.storage.salvarAvaliacao(candidato.id, nota);
    alert(`Avaliação de ${nota} estrelas salva para ${candidato.nome}!`);
    this.candidatosDaVaga = this.storage.getCandidatos(this.vagaSelecionada!.id);
  }

  logout(): void {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }

  selecionarCandidato(vaga: Vaga | null, candidato: Empregado): void {
    if (!vaga) return;

    this.storage.selecionarCandidato(vaga.id, candidato.id);
    alert(`Candidato ${candidato.nome} selecionado com sucesso!`);
  }
}
