import { Component, ViewChild, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vaga } from '../Model/vaga.type'; // <-- Remove VagasFake
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, filter, takeUntil } from 'rxjs'; // <-- Importa RxJs

@Component({
  selector: 'app-empregado',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './empregado.component.html',
  styleUrl: './empregado.component.scss'
})
export class EmpregadoComponent implements OnDestroy { // <-- Implementa OnDestroy

  constructor(private router: Router, private storage: StorageService) { }
  usuarioLogado!: { id: number, nome: string, email: string, senha: string };
  filtrosVisiveis: boolean = false;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChildren(MapMarker) allMarkers!: QueryList<MapMarker>;

  center: google.maps.LatLngLiteral = { lat: -23.5043, lng: -47.4582 };
  zoom = 16;
  raio = 3; // O raio do slider
  vagas: Vaga[] = []; // Array de vagas
  infoContent: Vaga | null = null;
  vagaSelecionada: Vaga | null = null;

  // Subject para gerenciar a desinscrição
  private destroy$ = new Subject<void>();

  ngOnInit() {
    const usuario = localStorage.getItem('loggedInUser');
    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
    } else {
      this.router.navigate(['/login']);
      return;
    }

    // Inicia o carregamento com a localização do GPS
    this.carregarVagasBaseadasNaLocalizacao();

    // Inscreve-se para futuras atualizações (ex: candidatar-se)
    this.storage.onDBUpdate$
      .pipe(
        filter(scope => scope === 'vagas'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('Dashboard: Vagas atualizadas, recarregando...');
        // Recarrega as vagas mantendo o centro e raio atuais
        this.atualizarVagasComRaio(this.center, this.raio);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtém a geolocalização do usuário e inicia o processo de atualização de vagas.
   */
  private carregarVagasBaseadasNaLocalizacao() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // Gera as vagas com base no centro e no raio padrão (3km)
        this.atualizarVagasComRaio(this.center, this.raio);
      }, () => {
        console.warn("Geolocalização negada. Usando localização padrão.");
        this.atualizarVagasComRaio(this.center, this.raio);
      });
    } else {
      this.atualizarVagasComRaio(this.center, this.raio);
    }
  }

  /**
   * Função principal:
   * 1. Busca TODAS as vagas (mock) do storage.
   * 2. RE-GERA posições aleatórias para elas dentro do `raioKm` fornecido.
   */
  private atualizarVagasComRaio(centro: google.maps.LatLngLiteral, raioKm: number): void {
    // 1. Busca TODAS as vagas do storage
    const todasVagas = this.storage.getVagas();

    // 2. Mapeia e GERA NOVAS POSIÇÕES para todas, usando o raio ATUAL
    this.vagas = todasVagas.map(vaga => ({
      ...vaga,
      nomeEmpresa: vaga.nomeEmpresa || 'Empresa Local',
      posicao: this.gerarCoordenadaAleatoria(centro, raioKm) // Usa o raioKm
    }));

    // 3. Atualiza a referência da vaga selecionada
    if (this.vagaSelecionada) {
      this.vagaSelecionada = this.vagas.find(v => v.id === this.vagaSelecionada!.id) || null;
    }
  }

  // --- Funções Públicas ---

  candidatar(empregadoId: number, vagaId: number) {
    this.storage.candidatar(empregadoId, vagaId);
    alert('Candidatura realizada com sucesso!');
    // O 'onDBUpdate$' cuidará de atualizar a UI
  }

  verPerfil() {
    this.router.navigate(['/perfil', this.usuarioLogado.id]);
  }

  /**
   * Chamado pelo botão "Atualizar Busca" (Filtro)
   * Re-busca a localização do GPS e re-gera as vagas com o raio ATUAL.
   */
  public obterLocalizacaoUsuario() {
    this.vagaSelecionada = null; // Fecha detalhes
    this.filtrosVisiveis = false;
    // Re-busca a localização do GPS e atualiza
    this.carregarVagasBaseadasNaLocalizacao();
  }

  /**
   * NOVO: Chamado quando o slider de range muda.
   * Apenas re-gera as vagas com o NOVO raio, sem buscar GPS.
   */
  public onRangeChange(): void {
    console.log(`Raio alterado para: ${this.raio} km`);
    // Não busca nova localização, apenas regenera as vagas com o novo raio
    this.atualizarVagasComRaio(this.center, this.raio);
  }

  abrirInfoWindow(marker: MapMarker, vaga: Vaga) {
    const distancia = this.calcularDistanciaKm(this.center, vaga.posicao);
    this.infoContent = {
      ...vaga,
      descricao: `${vaga.descricao.substring(0, 50)}... (Aprox. ${distancia.toFixed(2)} km)`
    };
    this.infoWindow.open(marker);
  }

  mostrarDetalhes(vaga: Vaga) {
    this.vagaSelecionada = vaga;
    const markerIndex = this.vagas.findIndex(v => v.id === vaga.id);
    const markersArray = this.allMarkers.toArray();

    if (markerIndex > -1 && markersArray[markerIndex]) {
      const marker = markersArray[markerIndex];
      // Não centralizamos mais o mapa ao clicar na lista, deixamos o usuário controlar
      // this.center = marker.getPosition()!.toJSON();
      this.abrirInfoWindow(marker, vaga);
    }
  }

  voltarParaLista() {
    this.vagaSelecionada = null;
  }

  // --- Métodos Privados (Helpers) ---

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

  private calcularDistanciaKm(coord1: google.maps.LatLngLiteral, coord2: google.maps.LatLngLiteral): number {
    if (!coord1 || !coord2) return Infinity;

    const R = 6371; // raio da Terra em km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLng = this.deg2rad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(coord1.lat)) *
      Math.cos(this.deg2rad(coord2.lat)) *
      Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
