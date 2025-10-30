export interface Vaga {
  id: number;
  nomeEmpresa: string;
  titulo: string;
  descricao: string;
  posicao: google.maps.LatLngLiteral;
  candidatos: number[];
  endereco?: string; // <-- ADICIONADO
  tempoMedioEstimado?: string; // <-- ADICIONADO
}
export const VagasFake: Vaga[] = [
  {
    id: 1,
    nomeEmpresa: 'Tech Solutions',
    titulo: 'Desenvolvedor Front-end',
    descricao: 'Projeto de 3 meses com Angular e TypeScript. Trabalho híbrido.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua da Tecnologia, 123, Sorocaba/SP',
    tempoMedioEstimado: '3 meses'
  },
  {
    id: 2,
    nomeEmpresa: 'Bar & Eventos Ltda',
    titulo: 'Barman para evento de sábado',
    descricao: 'Serviço em festa de casamento com 100 convidados. Experiência com drinks clássicos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. dos Eventos, 500, Votorantim/SP',
    tempoMedioEstimado: '1 dia (Sábado)'
  },
  {
    id: 3,
    nomeEmpresa: 'Dog Walker Company',
    titulo: 'Passeador de cães',
    descricao: 'Passear com 2 cachorros de porte médio, 1 hora por dia. Horário flexível.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Bairro Campolim, Sorocaba/SP',
    tempoMedioEstimado: 'Recorrente (1h/dia)'
  },
  {
    id: 4,
    nomeEmpresa: 'Supermarket SA',
    titulo: 'Repositor de prateleiras',
    descricao: 'Organização e reposição de produtos no setor de matinais.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Principal, 789, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  // NOVOS 40 REGISTROS
  {
    id: 5,
    nomeEmpresa: 'Logística Rápida',
    titulo: 'Motorista de entrega',
    descricao: 'Entrega de mercadorias leves na região de Sorocaba. CNH B obrigatória.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Logística, 101, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 6,
    nomeEmpresa: 'Casa da Limpeza',
    titulo: 'Auxiliar de limpeza',
    descricao: 'Limpeza de escritórios comerciais, 4h por dia.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Limpa, 45, Sorocaba/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 7,
    nomeEmpresa: 'Food Truck Express',
    titulo: 'Atendente de Food Truck',
    descricao: 'Atendimento em food truck durante eventos de rua.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Praça Central, Votorantim/SP',
    tempoMedioEstimado: 'Final de semana'
  },
  {
    id: 8,
    nomeEmpresa: 'Startup Green',
    titulo: 'Analista de Marketing Digital',
    descricao: 'Planejamento de campanhas e gerenciamento de redes sociais.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Inovação, 200, Sorocaba/SP',
    tempoMedioEstimado: '3 meses'
  },
  {
    id: 9,
    nomeEmpresa: 'Construtora Nova',
    titulo: 'Pedreiro',
    descricao: 'Construção de residências, experiência mínima 2 anos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua da Obra, 50, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 10,
    nomeEmpresa: 'Loja Fashion',
    titulo: 'Vendedor(a) de roupas',
    descricao: 'Atendimento a clientes e organização de estoque.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Moda, 120, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 11,
    nomeEmpresa: 'Café do Bairro',
    titulo: 'Barista',
    descricao: 'Preparar cafés especiais e atender clientes.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua do Café, 10, Sorocaba/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 12,
    nomeEmpresa: 'Academia Fit',
    titulo: 'Instrutor de Musculação',
    descricao: 'Aulas individuais e acompanhamento de alunos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Fitness, 300, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 13,
    nomeEmpresa: 'TecnoServ',
    titulo: 'Suporte Técnico',
    descricao: 'Atendimento remoto e presencial, manutenção de computadores.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Tecnologia, 75, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 14,
    nomeEmpresa: 'Pet Shop Amor',
    titulo: 'Atendente de Pet Shop',
    descricao: 'Venda de produtos e atendimento de clientes.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Pet, 20, Votorantim/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 15,
    nomeEmpresa: 'Escola Aprender',
    titulo: 'Professor de Inglês',
    descricao: 'Aulas para crianças e adolescentes.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Educação, 101, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 16,
    nomeEmpresa: 'Supermercado Central',
    titulo: 'Caixa',
    descricao: 'Atendimento no caixa e organização de filas.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Mercado, 400, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 17,
    nomeEmpresa: 'Studio Criativo',
    titulo: 'Designer Gráfico',
    descricao: 'Criação de banners, posts e identidade visual.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Design, 88, Sorocaba/SP',
    tempoMedioEstimado: '3 meses'
  },
  {
    id: 18,
    nomeEmpresa: 'Serviço Delivery',
    titulo: 'Motoboy',
    descricao: 'Entrega de pedidos rápidos em Sorocaba.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Entrega, 15, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 19,
    nomeEmpresa: 'Lanchonete Express',
    titulo: 'Atendente de Lanchonete',
    descricao: 'Preparar sanduíches, sucos e atendimento ao cliente.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Lanches, 70, Votorantim/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 20,
    nomeEmpresa: 'Construtora Nova Era',
    titulo: 'Ajudante de Obra',
    descricao: 'Auxílio em construções, carga e descarga de materiais.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Construção, 5, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 21,
    nomeEmpresa: 'Oficina AutoTech',
    titulo: 'Mecânico Automotivo',
    descricao: 'Manutenção de carros leves e revisão de veículos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Mecânica, 99, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 22,
    nomeEmpresa: 'Padaria Pão Doce',
    titulo: 'Padeiro',
    descricao: 'Preparação de pães e doces tradicionais.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Pão, 120, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 23,
    nomeEmpresa: 'Loja Eletrônica',
    titulo: 'Vendedor de Eletrônicos',
    descricao: 'Atendimento e vendas de produtos eletrônicos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Tecnologia, 45, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 24,
    nomeEmpresa: 'Academia Strong',
    titulo: 'Personal Trainer',
    descricao: 'Treinos personalizados para alunos da academia.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Fitness, 222, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 25,
    nomeEmpresa: 'Eventos & Cia',
    titulo: 'Organizador de Eventos',
    descricao: 'Planejamento e execução de eventos corporativos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Eventos, 300, Votorantim/SP',
    tempoMedioEstimado: '3 meses'
  },
  {
    id: 26,
    nomeEmpresa: 'PetCare',
    titulo: 'Veterinário',
    descricao: 'Atendimento de animais de pequeno porte.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Pet, 77, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 27,
    nomeEmpresa: 'Loja de Calçados',
    titulo: 'Vendedor(a) de Calçados',
    descricao: 'Atendimento a clientes, organização de estoque e vitrine.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Sapato, 11, Sorocaba/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 28,
    nomeEmpresa: 'Tech Mobile',
    titulo: 'Assistente de Suporte',
    descricao: 'Suporte técnico e orientação a clientes de smartphones.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Mobile, 33, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 29,
    nomeEmpresa: 'Escola Kids',
    titulo: 'Auxiliar de Educação Infantil',
    descricao: 'Auxílio em atividades pedagógicas e recreativas.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Educação, 77, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 30,
    nomeEmpresa: 'Supermercado Bom Preço',
    titulo: 'Repositor de Mercadorias',
    descricao: 'Reposição e organização de produtos nas prateleiras.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Central, 400, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 31,
    nomeEmpresa: 'Restaurante Sabor',
    titulo: 'Cozinheiro',
    descricao: 'Preparar pratos rápidos e organizar cozinha.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Sabor, 25, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 32,
    nomeEmpresa: 'Startup DevHub',
    titulo: 'Desenvolvedor Back-end',
    descricao: 'Node.js e APIs REST, projeto de médio prazo.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Dev, 101, Sorocaba/SP',
    tempoMedioEstimado: '3 meses'
  },
  {
    id: 33,
    nomeEmpresa: 'Transporte Rápido',
    titulo: 'Entregador de Bicicleta',
    descricao: 'Entrega de documentos e pequenos pacotes na região central.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Bike, 12, Sorocaba/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 34,
    nomeEmpresa: 'Loja Brinquedos',
    titulo: 'Atendente de Loja',
    descricao: 'Venda de brinquedos, atendimento ao cliente e organização de estoque.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Criança, 50, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 35,
    nomeEmpresa: 'Confeitaria Doce Vida',
    titulo: 'Confeiteiro(a)',
    descricao: 'Produção de bolos, doces e sobremesas para encomendas.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Doce, 60, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 36,
    nomeEmpresa: 'Escritório Contábil',
    titulo: 'Assistente Contábil',
    descricao: 'Lançamentos, conciliações e atendimento a clientes.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Contábil, 80, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 37,
    nomeEmpresa: 'Loja de Informática',
    titulo: 'Técnico de Informática',
    descricao: 'Manutenção de computadores, redes e suporte ao cliente.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Informática, 23, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 38,
    nomeEmpresa: 'Eventos Vip',
    titulo: 'Fotógrafo de Eventos',
    descricao: 'Cobertura fotográfica em festas e eventos corporativos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Fotografia, 77, Votorantim/SP',
    tempoMedioEstimado: 'Evento pontual'
  },
  {
    id: 39,
    nomeEmpresa: 'Loja de Cosméticos',
    titulo: 'Consultor(a) de Beleza',
    descricao: 'Atendimento, demonstração de produtos e vendas.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Beleza, 11, Sorocaba/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 40,
    nomeEmpresa: 'Transportes Alpha',
    titulo: 'Auxiliar de Carga e Descarga',
    descricao: 'Movimentação de produtos em depósito e caminhões.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Transporte, 99, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 41,
    nomeEmpresa: 'Pizzaria Saborosa',
    titulo: 'Pizzaiolo',
    descricao: 'Preparação de pizzas e atendimento aos pedidos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Pizza, 40, Sorocaba/SP',
    tempoMedioEstimado: 'Integral (CLT)'
  },
  {
    id: 42,
    nomeEmpresa: 'Studio de Dança',
    titulo: 'Instrutor de Dança',
    descricao: 'Aulas de dança para crianças e adultos, horários flexíveis.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Av. Dança, 55, Sorocaba/SP',
    tempoMedioEstimado: 'Meio período'
  },
  {
    id: 43,
    nomeEmpresa: 'Cafeteria Aroma',
    titulo: 'Atendente de Cafeteria',
    descricao: 'Preparação de cafés e lanches rápidos.',
    posicao: { lat: 0, lng: 0 },
    candidatos: [],
    endereco: 'Rua Aroma, 15, Sorocaba/SP',
    tempoMedioEstimado: 'Meio período'
  },
];
