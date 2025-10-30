import { Injectable } from '@angular/core';
import { Empregado } from './Model/empregado.type';
import { Empregador } from './Model/empregador.type';
import { Vaga, VagasFake } from './Model/vaga.type';
import { Subject } from 'rxjs'; // <-- 1. IMPORTAR Subject

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly DB_KEY = 'workmapDB';

  // 2. Criar um Subject privado para notificar mudanças
  private dbUpdated$ = new Subject<string>();

  // 3. Expor o Subject como um Observable público
  public onDBUpdate$ = this.dbUpdated$.asObservable();

  /**
   * Obtém todo o banco de dados do LocalStorage.
   * Se não existir, inicializa com valores padrão.
   */
  private getDB(): any {
    const db = localStorage.getItem(this.DB_KEY);
    if (db) {
      return JSON.parse(db);
    } else {
      const initialDB = {
        empregados: [],
        empregadores: [],
        vagas: VagasFake // Começa com as vagas fakes
      };
      this.saveDB(initialDB, 'init'); // Salva e notifica
      return initialDB;
    }
  }

  /**
   * Salva o objeto completo do banco de dados no LocalStorage.
   * @param db O objeto do banco de dados a ser salvo.
   * @param scope O tipo de dados que foi alterado (ex: 'vagas', 'empregados')
   */
  private saveDB(db: any, scope: string): void {
    localStorage.setItem(this.DB_KEY, JSON.stringify(db));
    // 4. Notificar todos os inscritos sobre a mudança
    this.dbUpdated$.next(scope);
  }

  // ---------------- EMPREGADOS ----------------

  salvarEmpregado(empregado: Empregado) {
    const db = this.getDB();
    const index = db.empregados.findIndex((e: Empregado) => e.id === empregado.id);

    if (index > -1) {
      db.empregados[index] = empregado; // Atualiza
    } else {
      db.empregados.push(empregado); // Adiciona
    }

    this.saveDB(db, 'empregados'); // <-- 5. Especificar o escopo
  }

  getEmpregadoById(id: number): Empregado | undefined {
    const db = this.getDB();
    return db.empregados.find((e: Empregado) => e.id === id);
  }

  getEmpregados(): Empregado[] {
    const db = this.getDB();
    return db.empregados;
  }

  // ---------------- EMPREGADORES ----------------

  salvarEmpregador(empregador: Empregador) {
    const db = this.getDB();
    const index = db.empregadores.findIndex((e: Empregador) => e.id === empregador.id);

    if (index > -1) {
      db.empregadores[index] = empregador; // Atualiza
    } else {
      db.empregadores.push(empregador); // Adiciona
    }
    this.saveDB(db, 'empregadores'); // <-- 5. Especificar o escopo
  }

  getEmpregadores(): Empregador[] {
    const db = this.getDB();
    return db.empregadores;
  }

  // ---------------- VAGAS ----------------

  salvarVagas(vagas: Vaga[]) {
    const db = this.getDB();
    db.vagas = vagas;
    this.saveDB(db, 'vagas'); // <-- 5. Especificar o escopo
  }

  getVagas(): Vaga[] {
    const db = this.getDB();
    return db.vagas;
  }

  candidatar(empregadoId: number, vagaId: number) {
    const db = this.getDB();
    const vaga = db.vagas.find((v: Vaga) => v.id === vagaId);

    if (vaga) {
      if (!vaga.candidatos) {
        vaga.candidatos = [];
      }
      if (!vaga.candidatos.includes(empregadoId)) {
        vaga.candidatos.push(empregadoId);
        this.saveDB(db, 'vagas'); // <-- 5. Especificar o escopo
      }
    }
  }

  getCandidatos(vagaId: number): Empregado[] {
    const db = this.getDB();
    const vaga = db.vagas.find((v: Vaga) => v.id === vagaId);

    if (!vaga || !vaga.candidatos) {
      return [];
    }

    // Filtra a lista de empregados para retornar apenas os que se candidataram
    return db.empregados.filter((e: Empregado) => vaga.candidatos.includes(e.id));
  }

  getVagasAplicadas(empregadoId: number): Vaga[] {
    const db = this.getDB();
    // Filtra a lista de vagas, retornando apenas aquelas que incluem o ID do empregado
    // no array de candidatos.
    return db.vagas.filter((vaga: Vaga) => vaga.candidatos?.includes(empregadoId));
  }
}
