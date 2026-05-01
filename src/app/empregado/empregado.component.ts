import { Component, ViewChild, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';

import { ApiService, VagaAPI } from '../api.service';

// Tipo interno que une VagaAPI + posicao para o mapa + candidatosIds como number[]
interface VagaMapa extends VagaAPI {
  posicao: google.maps.LatLngLiteral;
  candidatosIds: number[];
}

@Component({
  selector: 'app-empregado',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './empregado.component.html',
  styleUrl: './empregado.component.scss'
})
export class EmpregadoComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private api: ApiService) { }

  usuarioLogado!: { id: number; nome: string; email: string; role: string };
  filtrosVisiveis = false;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChildren(MapMarker) allMarkers!: QueryList<MapMarker>;

  center: google.maps.LatLngLiteral = { lat: -23.5043, lng: -47.4582 };
  zoom = 16;
  raio = 3;
  private vagasAPI: VagaAPI[] = [];

  vagas: VagaMapa[] = [];
  infoContent: VagaMapa | null = null;
  vagaSelecionada: VagaMapa | null = null;
  temNotificacao = false;
  carregando = false;

  private destroy$ = new Subject<void>();

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit() {
    const raw = localStorage.getItem('loggedInUser');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuarioLogado = JSON.parse(raw);
    this.carregarVagasBaseadasNaLocalizacao();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carregar vagas ────────────────────────────────────────────────────────

  private carregarVagasBaseadasNaLocalizacao() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.buscarVagas();
        },
        () => {
          console.warn('Geolocalização negada. Usando localização padrão.');
          this.buscarVagas();
        }
      );
    } else {
      this.buscarVagas();
    }
  }

  private buscarVagas() {
    this.carregando = true;
    this.api.listarVagas().pipe(takeUntil(this.destroy$)).subscribe({
      next: (vagas) => {
        this.vagasAPI = vagas; // guarda original com lat/lng reais
        this.aplicarFiltroDeRaio();
        this.carregando = false;
      },
      error: () => { this.carregando = false; }
    });
  }

  /**
   * Filtra as vagasAPI pelo raio real e converte para VagaMapa.
   * Vagas sem coordenada (lat=0/lng=0) são sempre exibidas
   * com posição estimada (não podemos excluí-las).
   */

  private aplicarFiltroDeRaio(): void {
    const vagasFiltradas = this.vagasAPI.filter(vaga => {
      const temCoordenada = vaga.lat && vaga.lng &&
        (vaga.lat !== 0 || vaga.lng !== 0);

      if (!temCoordenada) return true; // sem coordenada: exibe sempre

      const distancia = this.calcularDistanciaKm(
        this.center,
        { lat: vaga.lat!, lng: vaga.lng! }
      );
      return distancia <= this.raio;
    });

    this.vagas = vagasFiltradas.map(vaga => {
      const temCoordenada = vaga.lat && vaga.lng &&
        (vaga.lat !== 0 || vaga.lng !== 0);
      return {
        ...vaga,
        nomeEmpresa: vaga.nomeEmpresa || 'Empresa Local',
        posicao: temCoordenada
          ? { lat: vaga.lat!, lng: vaga.lng! }
          : this.gerarCoordenadaAleatoria(this.center, this.raio),
        candidatosIds: (vaga.candidatos ?? []).map((c: any) =>
          typeof c === 'number' ? c : c.id
        )
      };
    });

    this.verificarNotificacoes();
  }


  /**
   * Converte VagaAPI[] → VagaMapa[]:
   * - extrai candidatosIds (backend retorna objetos, não IDs)
   * - gera posicao aleatória ao redor do usuário
   */
  private mapearParaMapa(vagas: VagaAPI[]): VagaMapa[] {
    return vagas.map(vaga => ({
      ...vaga,
      nomeEmpresa: vaga.nomeEmpresa || 'Empresa Local',
      posicao: (vaga.lat && vaga.lng && (vaga.lat !== 0 || vaga.lng !== 0))
        ? { lat: vaga.lat, lng: vaga.lng }
        : this.gerarCoordenadaAleatoria(this.center, this.raio),
      candidatosIds: (vaga.candidatos ?? []).map((c: any) =>
        typeof c === 'number' ? c : c.id
      )
    }));
  }

  // ── Candidatura ───────────────────────────────────────────────────────────

 // empregado.component.ts
candidatar(empregadoId: number, vagaId: number) {
  this.api.candidatar(vagaId, empregadoId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        // Atualiza localmente sem recarregar toda a API
        this.vagas = this.vagas.map(v => {
          if (v.id === vagaId) {
            return {
              ...v,
              candidatosIds: [...v.candidatosIds, empregadoId]
            };
          }
          return v;
        });

        // Atualiza vagaSelecionada se for a mesma vaga
        if (this.vagaSelecionada?.id === vagaId) {
          this.vagaSelecionada = {
            ...this.vagaSelecionada,
            candidatosIds: [...this.vagaSelecionada.candidatosIds, empregadoId]
          };
        }

        // Atualiza infoContent se estiver aberto
        if (this.infoContent?.id === vagaId) {
          this.infoContent = {
            ...this.infoContent,
            candidatosIds: [...this.infoContent.candidatosIds, empregadoId]
          };
        }

        alert('✅ Candidatura realizada com sucesso!');
      },
      error: () => alert('Erro ao se candidatar. Tente novamente.')
    });
}

  // ── Notificações ──────────────────────────────────────────────────────────

  private verificarNotificacoes(): void {
    this.temNotificacao = this.vagas.some(vaga =>
      vaga.status === 'PREENCHIDA' &&
      vaga.candidatoSelecionadoId === this.usuarioLogado.id &&
      vaga.candidatosIds.includes(this.usuarioLogado.id)
    );
  }

  // ── Status da candidatura ─────────────────────────────────────────────────

  public getStatusCandidatura(vaga: VagaMapa | null): string {
    if (!vaga || !this.usuarioLogado) return 'NaoInscrito';

    const seCandidatou = vaga.candidatosIds.includes(this.usuarioLogado.id);
    if (!seCandidatou) return 'NaoInscrito';

    if (vaga.status === 'ABERTA') return 'Pendente';
    if (vaga.candidatoSelecionadoId === this.usuarioLogado.id) return 'Aceito';
    return 'Recusado';
  }

  public isCandidato(vaga: VagaMapa | null): boolean {
    return !!vaga && vaga.candidatosIds.includes(this.usuarioLogado.id);
  }

  // ── Mapa ──────────────────────────────────────────────────────────────────

  abrirInfoWindow(marker: MapMarker, vaga: VagaMapa) {
    const distancia = this.calcularDistanciaKm(this.center, vaga.posicao);
    this.infoContent = {
      ...vaga,
      descricao: `${vaga.descricao.substring(0, 50)}... (Aprox. ${distancia.toFixed(2)} km)`
    };
    this.infoWindow.open(marker);
  }

  mostrarDetalhes(vaga: VagaMapa) {
    this.vagaSelecionada = vaga;
    const idx = this.vagas.findIndex(v => v.id === vaga.id);
    const markers = this.allMarkers.toArray();
    if (idx > -1 && markers[idx]) {
      this.abrirInfoWindow(markers[idx], vaga);
    }
  }

  voltarParaLista() { this.vagaSelecionada = null; }
  verPerfil() { this.router.navigate(['/perfil', this.usuarioLogado.id]); }

  public obterLocalizacaoUsuario() {
    this.vagaSelecionada = null;
    this.filtrosVisiveis = false;
    this.carregarVagasBaseadasNaLocalizacao();
  }

  public onRangeChange(): void {
    this.aplicarFiltroDeRaio();
  }

  public getMarkerOptions(vaga: VagaMapa): google.maps.MarkerOptions {
    const status = this.getStatusCandidatura(vaga);
    let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    if (status === 'Pendente') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    if (status === 'Aceito') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    return { icon: iconUrl };
  }

  // ── Utils ─────────────────────────────────────────────────────────────────

  private gerarCoordenadaAleatoria(centro: google.maps.LatLngLiteral, raioKm: number): google.maps.LatLngLiteral {
    const raioEmGraus = raioKm / 111;
    const u = Math.random(), v = Math.random();
    const w = raioEmGraus * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    return {
      lat: centro.lat + w * Math.cos(t),
      lng: centro.lng + (w * Math.sin(t)) / Math.cos((centro.lat * Math.PI) / 180)
    };
  }

  private calcularDistanciaKm(c1: google.maps.LatLngLiteral, c2: google.maps.LatLngLiteral): number {
    if (!c1 || !c2) return Infinity;
    const R = 6371;
    const dLat = this.deg2rad(c2.lat - c1.lat);
    const dLng = this.deg2rad(c2.lng - c1.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(c1.lat)) * Math.cos(this.deg2rad(c2.lat)) *
      Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number { return (deg * Math.PI) / 180; }
}