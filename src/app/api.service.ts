import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';


// ─── Tipos que espelhamos do backend ────────────────────────────────────────

export interface VagaAPI {
  id?: number;
  titulo: string;
  descricao: string;
  nomeEmpresa: string;
  endereco?: string;
  tempoMedioEstimado?: string;
  status?: 'ABERTA' | 'PREENCHIDA';   // enum do backend (maiúsculo)
  lat?: number;
  lng?: number;
  autor?: { id: number };             // só precisamos do id ao criar
  candidatos?: CandidatoAPI[];
  candidatoSelecionadoId?: number;
}

export interface CandidatoAPI {
  id: number;
  nome: string;
  email: string;
  idade?: number;
  cidade?: string;
  telefone?: string;
  descricao?: string;
  avaliacao?: number;
  experiencia?: string;
}


export interface LoginResponse {
  email: string;
  token: string;
  perfil: 'CANDIDATO' | 'EMPREGADOR';
  candidatoId?: number;
  empregadorId?: number;
}

// ─── Helpers de conversão (backend ↔ frontend) ──────────────────────────────

/** Backend retorna status em MAIÚSCULO; frontend usa capitalizado */
export function toStatusFrontend(status: string): 'Aberta' | 'Preenchida' {
  return status === 'PREENCHIDA' ? 'Preenchida' : 'Aberta';
}

export function toStatusBackend(status: string): 'ABERTA' | 'PREENCHIDA' {
  return status === 'Preenchida' ? 'PREENCHIDA' : 'ABERTA';
}

// ────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ApiService {

  /** Troque pela URL do seu backend quando estiver em produção */

  //uso da api renderizada: https://back-end-emprego.onrender.com
  private readonly BASE_URL = 'https://back-end-emprego.onrender.com';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  /**
   * Registra um novo usuário.
   * @param role  'CANDIDATO' | 'EMPREGADOR'
   */

  // this.api.registro({ nome, email, senha, role, cidade, telefone, idade: String(idade) })
  registro(payload: {
    nome: string;
    email: string;
    senha: string;
    role: 'CANDIDATO' | 'EMPREGADOR';
    cidade: string;
    telefone: string;
    idade: string;
  }): Observable<string> {
    return this.http.post(`${this.BASE_URL}/api/auth/registrar`, {
      nome: payload.nome,
      email: payload.email,
      senha: payload.senha,
      perfil: payload.role,
      cidade: payload.cidade,
      telefone: payload.telefone,
      idade: Number(payload.idade)
    }, {
      responseType: 'text'
    });
  }
  /**
   * Faz login e devolve { id, role } extraídos da resposta do backend.
   * Backend retorna: "Login realizado! Id: 3"
   */
  login(email: string, senha: string, role: 'CANDIDATO' | 'EMPREGADOR'): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/api/auth`, {
      email,
      senha
    }).pipe(
      map((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.perfil.toLowerCase());

        const id = response.perfil === 'EMPREGADOR'
          ? response.empregadorId
          : response.candidatoId;

        localStorage.setItem('loggedInUser', JSON.stringify({
          id,
          email: response.email,
          nome: response.email.split('@')[0],
          role: response.perfil
        }));

        return response;
      })
    );
  }

  // ── Vagas ─────────────────────────────────────────────────────────────────

  /** Lista todas as vagas */
  listarVagas(): Observable<VagaAPI[]> {
    return this.http.get<VagaAPI[]>(`${this.BASE_URL}/vagas`, {
      headers: this.getAuthHeaders()
    });
  }
  /** Busca uma vaga pelo ID */
  buscarVaga(id: number): Observable<VagaAPI> {
    return this.http.get<VagaAPI>(`${this.BASE_URL}/vagas/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Cria uma nova vaga.
   * Monta o objeto no formato que o backend espera:
   *   - autor: { id } para o @ManyToOne
   *   - lat / lng separados (não posicao: {lat, lng})
   *   - status em MAIÚSCULO
   */
  criarVaga(vaga: {
    titulo: string;
    descricao: string;
    nomeEmpresa: string;
    endereco?: string;
    tempoMedioEstimado?: string;
    lat?: number;
    lng?: number;
    autorId: number;
  }): Observable<VagaAPI> {
    const payload: VagaAPI = {
      titulo: vaga.titulo,
      descricao: vaga.descricao,
      nomeEmpresa: vaga.nomeEmpresa,
      endereco: vaga.endereco,
      tempoMedioEstimado: vaga.tempoMedioEstimado,
      lat: vaga.lat ?? 0,
      lng: vaga.lng ?? 0,
      status: 'ABERTA',
      autor: { id: vaga.autorId }
    };

    return this.http.post<VagaAPI>(`${this.BASE_URL}/vagas`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  /** Atualiza título, descrição e endereço de uma vaga */
  atualizarVaga(id: number, dados: Partial<VagaAPI>): Observable<VagaAPI> {
    return this.http.put<VagaAPI>(`${this.BASE_URL}/vagas/${id}`, dados, {
      headers: this.getAuthHeaders()
    });
  }
  /** Remove uma vaga */
  deletarVaga(id: number): Observable<string> {
    return this.http.delete(`${this.BASE_URL}/vagas/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  /** Lista os candidatos de uma vaga */

  listarCandidatos(vagaId: number): Observable<CandidatoAPI[]> {
    return this.http.get<CandidatoAPI[]>(`${this.BASE_URL}/vagas/${vagaId}/candidatos`, {
      headers: this.getAuthHeaders()
    });
  }
  /**
   * Endpoint de candidatura (usado pelo lado mobile/empregado).
   * Mantido aqui para completude.
   */
  candidatar(vagaId: number, candidatoId: number): Observable<string> {
    return this.http.post(
      `${this.BASE_URL}/vagas/${vagaId}/candidatar/${candidatoId}`,
      {},
      { responseType: 'text' }
    );
  }

  // ── Candidatos (Perfil) ───────────────────────────────────────────────────

  /** Busca o perfil de um candidato pelo ID */
  buscarCandidato(id: number): Observable<CandidatoAPI> {
    return this.http.get<CandidatoAPI>(`${this.BASE_URL}/candidatos/${id}`);
  }

  /** Atualiza as informações do perfil do candidato */
  atualizarCandidato(id: number, dados: Partial<CandidatoAPI>): Observable<CandidatoAPI> {
    return this.http.put<CandidatoAPI>(`${this.BASE_URL}/candidatos/${id}`, dados);
  }

  /** Busca a lista de vagas nas quais o candidato se aplicou */
  listarVagasAplicadas(candidatoId: number): Observable<VagaAPI[]> {
    return this.http.get<VagaAPI[]>(`${this.BASE_URL}/candidatos/${candidatoId}/vagas-aplicadas`);
  }
  // api.service.ts
  avaliarCandidato(candidatoId: number, nota: number): Observable<string> {
    return this.http.put(`${this.BASE_URL}/candidatos/${candidatoId}/avaliar`, { nota }, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }
}