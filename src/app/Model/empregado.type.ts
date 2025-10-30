export interface Empregado {
  id: number;
  nome: string;
  email: string;
  senha: string;
  idade : number;
  cidade : string;
  descricao?: string;
  avaliacao?: number;
  experiencia?: string;
}
