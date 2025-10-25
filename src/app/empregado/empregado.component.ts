import { Component, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vaga, VagasFake } from '../Model/vaga.type';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';


@Component({
  selector: 'app-empregado',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, FormsModule],
  templateUrl: './empregado.component.html',
  styleUrl: './empregado.component.scss'
})
export class EmpregadoComponent {

  constructor(private router: Router, private storage: StorageService) { }
  usuarioLogado!: { id: number, nome: string, email: string, senha: string };

  candidatar(empregadoId: number, vagaId: number) {
  this.storage.candidatar(empregadoId, vagaId);
  alert('Candidatura realizada com sucesso!');
}


  verPerfil() {
    this.router.navigate(['/perfil', this.usuarioLogado.id]);
  }
  filtrosVisiveis: boolean = false;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  center: google.maps.LatLngLiteral = { lat: -23.5043, lng: -47.4582 };
  zoom = 16;
  raio = 3;
  vagas: Vaga[] = [];

  infoContent: { id: number; titulo: string; descricao: string } = {
    id: 0,
    titulo: '',
    descricao: ''
  };


  ngOnInit() {
    const usuario = localStorage.getItem('loggedInUser');
    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
    } else {
      // redireciona para login se não tiver usuário logado
      this.router.navigate(['/login']);
      return;
    }


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Copia as vagas e atribui posição aleatória
        this.vagas = VagasFake.map(vaga => ({
          ...vaga,
          posicao: this.gerarCoordenadaAleatoria(this.center, 3)
        }));
      });
    }
  }


  public obterLocalizacaoUsuario() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      this.vagas = this.gerarVagasMock(10, this.center, this.raio);
      this.filtrosVisiveis = false
    });
  }

  abrirInfoWindow(marker: MapMarker, vaga: Vaga) {
    const distancia = this.calcularDistanciaKm(this.center, vaga.posicao);
    this.infoContent = {
      id: vaga.id, // ADICIONE O ID
      titulo: vaga.titulo,
      descricao: `${vaga.descricao} - Aproximadamente ${distancia.toFixed(2)} km de você`
    };
    this.infoWindow.open(marker);
  }



  private gerarVagasMock(qtd: number, centro: google.maps.LatLngLiteral, raioKm: number): Vaga[] {
    const vagas: Vaga[] = [];
    for (let i = 0; i < qtd; i++) {
      vagas.push({
        id: i + 1,
        titulo: `Vaga ${i + 1}`,
        descricao: `Descrição da vaga ${i + 1}`,
        posicao: this.gerarCoordenadaAleatoria(centro, raioKm),
        nomeEmpresa: '',
        candidatos: []
      });
    }
    return vagas;
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

  /** Calcula distância entre duas coordenadas em km */
  private calcularDistanciaKm(coord1: google.maps.LatLngLiteral, coord2: google.maps.LatLngLiteral): number {
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
