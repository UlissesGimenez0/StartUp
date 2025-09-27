export interface Vaga {
  id: number;
  nomeEmpresa : string;
  titulo: string;
  descricao: string;
  posicao: google.maps.LatLngLiteral;
}

export const VagasFake : Vaga[] = [
  {
      id: 1,
      nomeEmpresa: 'Tech Solutions',
      titulo: 'Desenvolvedor Front-end',
      descricao: 'Projeto de 3 meses com Angular e TypeScript',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 2,
      nomeEmpresa: 'Bar & Eventos Ltda',
      titulo: 'Barman para evento de sábado',
      descricao: 'Serviço em festa de casamento com 100 convidados',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 3,
      nomeEmpresa: 'Dog Walker Company',
      titulo: 'Passeador de cães',
      descricao: 'Passear com 2 cachorros de porte médio, 1 hora por dia',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 4,
      nomeEmpresa: 'Cafe do Bairro',
      titulo: 'Atendente de cafeteria',
      descricao: 'Atendimento ao cliente, preparo de cafés e lanches',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 5,
      nomeEmpresa: 'Startup X',
      titulo: 'Analista de Dados Júnior',
      descricao: 'Manipulação de dados e criação de dashboards',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 6,
      nomeEmpresa: 'Eventos e Festas',
      titulo: 'Fotógrafo de eventos',
      descricao: 'Cobertura de aniversários e casamentos',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 7,
      nomeEmpresa: 'Pet Lovers',
      titulo: 'Cuidador de animais',
      descricao: 'Alimentação e cuidados básicos com pets',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 8,
      nomeEmpresa: 'Delivery Express',
      titulo: 'Motoboy',
      descricao: 'Entrega de produtos em área urbana',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 9,
      nomeEmpresa: 'Academia Fit',
      titulo: 'Instrutor de musculação',
      descricao: 'Treinamento personalizado para alunos da academia',
      posicao: { lat: 0, lng: 0 }

  },
  {
      id: 10,
      nomeEmpresa: 'Supermarket SA',
      titulo: 'Repositor de prateleiras',
      descricao: 'Organização e reposição de produtos',
      posicao: { lat: 0, lng: 0 }

  }
];