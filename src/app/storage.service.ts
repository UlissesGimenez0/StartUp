import { Injectable } from '@angular/core';
import { Empregado } from './Model/empregado.type';
import { Empregador } from './Model/empregador.type';
import { Vaga, VagasFake } from './Model/vaga.type';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly DB_KEY = 'workmapDB';
  private readonly NOTIFY_KEY = 'workmapDB_notify';

  private dbUpdated$ = new Subject<string>();
  public onDBUpdate$ = this.dbUpdated$.asObservable();

  private getDB(): any {
    const db = localStorage.getItem(this.DB_KEY);
    if (db) {
      return JSON.parse(db);
    } else {
      const initialDB = {
        empregados: [],
        empregadores: [],
        vagas: VagasFake
      };
      this.saveDB(initialDB, 'init');
      return initialDB;
    }
  }

  private saveDB(db: any, scope: string): void {
    localStorage.setItem(this.DB_KEY, JSON.stringify(db));
    this.dbUpdated$.next(scope);

    localStorage.setItem(this.NOTIFY_KEY, `${scope}_${new Date().getTime()}`);
  }

  public notifyChange(scope: string) {
    console.log('Notificação externa recebida:', scope);
    this.dbUpdated$.next(scope);
  }

  salvarEmpregado(empregado: Empregado) {
    const db = this.getDB();
    const index = db.empregados.findIndex((e: Empregado) => e.id === empregado.id);

    if (index > -1) {
      db.empregados[index] = empregado;
    } else {
      db.empregados.push(empregado);
    }
    this.saveDB(db, 'empregados');
  }

  getEmpregadoById(id: number): Empregado | undefined {
    const db = this.getDB();
    return db.empregados.find((e: Empregado) => e.id === id);
  }

  getEmpregados(): Empregado[] {
    const db = this.getDB();
    return db.empregados;
  }

  salvarEmpregador(empregador: Empregador) {
    const db = this.getDB();
    const index = db.empregadores.findIndex((e: Empregador) => e.id === empregador.id);

    if (index > -1) {
      db.empregadores[index] = empregador;
    } else {
      db.empregadores.push(empregador);
    }
    this.saveDB(db, 'empregadores');
  }

  getEmpregadores(): Empregador[] {
    const db = this.getDB();
    return db.empregadores;
  }

  salvarVagas(vagas: Vaga[]) {
    const db = this.getDB();
    db.vagas = vagas;
    this.saveDB(db, 'vagas');
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
        this.saveDB(db, 'vagas');
      }
    }
  }

  getCandidatos(vagaId: number): Empregado[] {
    const db = this.getDB();
    const vaga = db.vagas.find((v: Vaga) => v.id === vagaId);

    if (!vaga || !vaga.candidatos) {
      return [];
    }
    return db.empregados.filter((e: Empregado) => vaga.candidatos.includes(e.id));
  }

  getVagasAplicadas(empregadoId: number): Vaga[] {
    const db = this.getDB();
    return db.vagas.filter((vaga: Vaga) => vaga.candidatos?.includes(empregadoId));
  }

  adicionarVaga(novaVaga: Vaga) {
    const db = this.getDB();
    db.vagas.push(novaVaga);
    this.saveDB(db, 'vagas');
  }

  salvarAvaliacao(empregadoId: number, nota: number) {
    const db = this.getDB();
    const empregado = db.empregados.find((e: Empregado) => e.id === empregadoId);

    if (empregado) {
      const avaliacaoAntiga = empregado.avaliacao || 0;
      if (avaliacaoAntiga === 0) {
        empregado.avaliacao = nota;
      } else {
        empregado.avaliacao = (avaliacaoAntiga + nota) / 2;
      }
      console.log(`Nova avaliação para ${empregado.nome}: ${empregado.avaliacao}`);
      this.saveDB(db, 'empregados');
    }
  }

  selecionarCandidato(vagaId: number, empregadoId: number) {
    const db = this.getDB();
    const vaga = db.vagas.find((v: Vaga) => v.id === vagaId);

    if (vaga) {
      vaga.status = 'Preenchida';
      vaga.candidatoSelecionadoId = empregadoId;
      console.log(`Candidato ${empregadoId} selecionado para a vaga ${vagaId}`);
      this.saveDB(db, 'vagas');
    }
  }
}
