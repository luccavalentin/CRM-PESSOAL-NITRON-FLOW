// Tipos principais do sistema

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Urgente'
export type StatusTarefa = 'Pendente' | 'Em Andamento' | 'Em Revisão' | 'Concluída'
export type StatusProjeto = 'Pendente' | 'Andamento' | 'Revisão' | 'Entregue' | 'Arquivado'
export type StatusProjetoPessoal = 'Planejamento' | 'Em Andamento' | 'Pausado' | 'Concluído' | 'Cancelado'
export type CategoriaTarefa = 'Pessoal' | 'Empresarial' | 'Projeto' | 'Outro'
export type CategoriaIdeia = 'Negócio' | 'Automação' | 'Projeto' | 'Conteúdo' | 'Outro'
export type StatusIdeia = 'Explorando' | 'Em Análise' | 'Em Teste' | 'Executando' | 'Arquivada'
export type TipoOperacao = 'CALL' | 'PUT'
export type ResultadoOperacao = 'Gain' | 'Loss'
export type StatusUsuario = 'Ativo' | 'Inativo'
export type CategoriaCompra = 'Mercado' | 'Diversas'
export type StatusCompra = 'Pendente' | 'Comprado'
export type StatusAula = 'Não iniciada' | 'Em andamento' | 'Concluída'
export type StatusRevisao = 'Agendada' | 'Realizada'
export type TipoVicio = 'Vício' | 'Hábito' | 'Mania'
export type StatusVicio = 'Ativo' | 'Superado'
export type TamanhoBilhete = 'Pequeno' | 'Médio' | 'Grande'
export type CategoriaBilhete = 'Motivacional' | 'Afirmação' | 'Gratidão' | 'Outro'
export type FormatoBilhete = 'Quadrado' | 'Retângulo' | 'Círculo'
export type MotivoBloqueio = 'stop_gain' | 'stop_loss' | 'limite_operacoes'

export interface Tarefa {
  id: string
  titulo: string
  descricao?: string
  prioridade: Prioridade
  categoria: CategoriaTarefa
  data: string
  status: StatusTarefa
  tarefaRapida: boolean
  projetoId?: string
  recorrente: boolean
  target?: string
  etiquetas: string[]
  concluida: boolean
}

export interface Projeto {
  id: string
  nome: string
  descricao: string
  status: StatusProjeto
  cliente?: string
  valor?: number
  etapasConcluidas: number
  totalEtapas: number
  dataInicio: string
  prazo?: string
  quantidadeAnexos: number
  ideiaId?: string
}

export interface ProjetoPessoal {
  id: string
  nome: string
  descricao: string
  status: StatusProjetoPessoal
  dataInicio: string
  prazo?: string
  progresso: number
  tarefasVinculadas: string[]
}

export interface Ideia {
  id: string
  texto: string
  categoria: CategoriaIdeia
  status: StatusIdeia
  potencialFinanceiro: number // 1-10
  dataCriacao: string
  tarefaId?: string
  projetoId?: string
}

export interface TransacaoFinanceira {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
  tipo: 'entrada' | 'saida'
}

export interface MetaFinanceira {
  id: string
  descricao: string
  valorMeta: number
  valorAtual: number
  dataLimite?: string
}

export interface GastoRecorrente {
  id: string
  descricao: string
  valor: number
  proximaData: string
  recorrencia: 'mensal' | 'anual'
}

export interface OperacaoTrading {
  id: string
  ativo: string
  tipo: TipoOperacao
  resultado: ResultadoOperacao
  valorEntrada: number
  lucroPrejuizo: number
  urlPrint?: string
  observacoes?: string
  dataHora: string
}

export interface ConfiguracaoTrading {
  capitalTotal: number
  metaDiariaPercentual: number
  stopGainReais: number
  stopGainPercentual: number
  stopLossReais: number
  stopLossPercentual: number
  valorMaximoEntrada: number
  limiteOperacoesDia: number
  dataInicio: string
  diaAtual: string
  bloqueado: boolean
  motivoBloqueio?: MotivoBloqueio
}

export interface SessaoAlavancagem {
  id: string
  capitalInicial: number
  numeroNiveis: number // 1-5
  metaPorNivel: number
  stopTotal: number
  stopProtegido?: number
  valorEntradas: number
  tipoEntrada: 'percentual' | 'fixo'
  status: 'ativa' | 'concluida'
  nivelAtual: number
  progressoPorNivel: number[]
}

export interface UsuarioApp {
  id: string
  nome: string
  email: string
  status: StatusUsuario
  plano: string
  aplicativoVinculado: string
  dataRegistro: string
  ultimoAcesso?: string
}

export interface ItemCompra {
  id: string
  nome: string
  quantidade: number
  valorEstimado: number
  categoria: CategoriaCompra
  status: StatusCompra
  recorrenciaMensal: boolean
}

export interface Aula {
  id: string
  titulo: string
  materiaId?: string
  nichoId?: string
  urlVideo: string
  duracao: number // em minutos
  status: StatusAula
  dataConclusao?: string
  notas?: string
}

export interface Materia {
  id: string
  nome: string
  descricao?: string
  cor: string
}

export interface Nicho {
  id: string
  nome: string
  descricao?: string
  cor: string
}

export interface Revisao {
  id: string
  aulaId: string
  dataRevisao: string
  notas?: string
  status: StatusRevisao
}

export interface VicioHabito {
  id: string
  nome: string
  descricao?: string
  tipo: TipoVicio
  dataInicioControle: string
  status: StatusVicio
  estrategiasSuperacao: string[]
}

export interface BilhetePositivo {
  id: string
  texto: string
  cor: string
  tamanho: TamanhoBilhete
  categoria: CategoriaBilhete
  fonte?: string
  emoji?: string
  formato: FormatoBilhete
  posicaoX: number
  posicaoY: number
}

