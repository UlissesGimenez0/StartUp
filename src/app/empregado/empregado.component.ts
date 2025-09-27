import { Component, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { Vaga, VagasFake } from '../Model/vaga.type';


@Component({
  selector: 'app-empregado',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './empregado.component.html',
  styleUrl: './empregado.component.scss'
})
export class EmpregadoComponent {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  center: google.maps.LatLngLiteral = { lat: -23.5043, lng: -47.4582 };
  zoom = 13;
  raio = 3; 
  vagas: Vaga[] = [];

  infoContent = { titulo: '', descricao: '' };

  ngOnInit() {
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

  
  private obterLocalizacaoUsuario() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      this.vagas = this.gerarVagasMock(10, this.center, this.raio);
    });
  }

  abrirInfoWindow(marker: MapMarker, vaga: Vaga) {
    const distancia = this.calcularDistanciaKm(this.center, vaga.posicao);
    this.infoContent = {
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
        nomeEmpresa: ''
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
