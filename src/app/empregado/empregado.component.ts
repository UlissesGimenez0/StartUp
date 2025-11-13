import { Component, ViewChild, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vaga } from '../Model/vaga.type';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, filter, takeUntil } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';

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
export class EmpregadoComponent implements OnDestroy {

  constructor(private router: Router, private storage: StorageService) { }
  usuarioLogado!: { id: number, nome: string, email: string, senha: string };
  filtrosVisiveis: boolean = false;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChildren(MapMarker) allMarkers!: QueryList<MapMarker>;

  center: google.maps.LatLngLiteral = { lat: -23.5043, lng: -47.4582 };
  zoom = 16;
  raio = 3;
  vagas: Vaga[] = [];
  infoContent: Vaga | null = null;
  vagaSelecionada: Vaga | null = null;

  temNotificacao: boolean = false;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    const usuario = localStorage.getItem('loggedInUser');
    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
    } else {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarVagasBaseadasNaLocalizacao();
    this.verificarNotificacoes();

    this.storage.onDBUpdate$
      .pipe(
        filter(scope => scope === 'vagas'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('Dashboard: Vagas atualizadas, recarregando...');
        this.atualizarVagasComRaio(this.center, this.raio);
        this.verificarNotificacoes();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private verificarNotificacoes(): void {
    const vagasAplicadas = this.storage.getVagasAplicadas(this.usuarioLogado.id);

    // --- [INÍCIO DA CORREÇÃO] ---
    // A lógica correta é checar se a vaga está 'Preenchida' E se o ID é o do usuário
    const temVagaAceita = vagasAplicadas.some(vaga =>
      vaga.status === 'Preenchida' && vaga.candidatoSelecionadoId === this.usuarioLogado.id
    );
    // --- [FIM DA CORREÇÃO] ---

    this.temNotificacao = temVagaAceita;
    console.log('Tem Notificação?', this.temNotificacao);
  }

  private carregarVagasBaseadasNaLocalizacao() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.atualizarVagasComRaio(this.center, this.raio);
      }, () => {
        console.warn("Geolocalização negada. Usando localização padrão.");
        this.atualizarVagasComRaio(this.center, this.raio);
      });
    } else {
      this.atualizarVagasComRaio(this.center, this.raio);
    }
  }

  private atualizarVagasComRaio(centro: google.maps.LatLngLiteral, raioKm: number): void {
    const todasVagas = this.storage.getVagas();

    this.vagas = todasVagas.map(vaga => ({
      ...vaga,
      nomeEmpresa: vaga.nomeEmpresa || 'Empresa Local',
      posicao: this.gerarCoordenadaAleatoria(centro, raioKm)
    }));

    if (this.vagaSelecionada) {
      const vagaAtualizada = this.vagas.find(v => v.id === this.vagaSelecionada!.id);
      this.vagaSelecionada = vagaAtualizada || null;
    }
  }

  candidatar(empregadoId: number, vagaId: number) {
    this.storage.candidatar(empregadoId, vagaId);
    alert('Candidatura realizada com sucesso!');
  }

  verPerfil() {
    this.router.navigate(['/perfil', this.usuarioLogado.id]);
  }

  public obterLocalizacaoUsuario() {
    this.vagaSelecionada = null;
    this.filtrosVisiveis = false;
    this.carregarVagasBaseadasNaLocalizacao();
  }

  public onRangeChange(): void {
    console.log(`Raio alterado para: ${this.raio} km`);
    this.atualizarVagasComRaio(this.center, this.raio);
  }

  abrirInfoWindow(marker: MapMarker, vaga: Vaga) {
    const vagaAtualizada = this.vagas.find(v => v.id === vaga.id) || vaga;

    const distancia = this.calcularDistanciaKm(this.center, vagaAtualizada.posicao);
    this.infoContent = {
      ...vagaAtualizada,
      descricao: `${vagaAtualizada.descricao.substring(0, 50)}... (Aprox. ${distancia.toFixed(2)} km)`
    };
    this.infoWindow.open(marker);
  }

  mostrarDetalhes(vaga: Vaga) {
    this.vagaSelecionada = vaga;
    const markerIndex = this.vagas.findIndex(v => v.id === vaga.id);
    const markersArray = this.allMarkers.toArray();

    if (markerIndex > -1 && markersArray[markerIndex]) {
      const marker = markersArray[markerIndex];
      this.abrirInfoWindow(marker, vaga);
    }
  }

  voltarParaLista() {
    this.vagaSelecionada = null;
  }

  public isCandidato(vaga: Vaga | null): boolean {
    if (!vaga || !vaga.candidatos || !this.usuarioLogado) {
      return false;
    }
    return vaga.candidatos.includes(this.usuarioLogado.id);
  }

  public getStatusCandidatura(vaga: Vaga | null): string {
    if (!vaga || !this.usuarioLogado) return 'NaoInscrito';

    const usuarioSeCandidatou = vaga.candidatos.includes(this.usuarioLogado.id);

    if (!usuarioSeCandidatou) {
      return 'NaoInscrito';
    }

    if (vaga.status === 'Aberta') {
      return 'Pendente';
    }

    if (vaga.candidatoSelecionadoId === this.usuarioLogado.id) {
      return 'Aceito';
    } else {
      return 'Recusado';
    }
  }

  public getMarkerOptions(vaga: Vaga): google.maps.MarkerOptions {
    const status = this.getStatusCandidatura(vaga);

    let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

    if (status === 'Pendente') {
      iconUrl = 'http://googleusercontent.com/maps.google.com/2';
    } else if (status === 'Aceito') {
      iconUrl = 'http://googleusercontent.com/maps.google.com/3';
    }

    return { icon: iconUrl };
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

  private calcularDistanciaKm(coord1: google.maps.LatLngLiteral, coord2: google.maps.LatLngLiteral): number {
    if (!coord1 || !coord2) return Infinity;

    const R = 6371;
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
