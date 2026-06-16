export type ServiceRequestStatus =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type PaymentStatus = 'PENDENTE' | 'AGUARDANDO' | 'PAGO' | 'FALHOU' | 'CANCELADO';

export type Payment = {
  id: string;
  valor: string;
  metodo: 'PIX' | 'CARTAO' | 'DINHEIRO';
  status: PaymentStatus;
  asaasPaymentId: string | null;
  pixQrCode: string | null;
  pixCopiaCola: string | null;
  pagoEm: string | null;
};

export type ServiceRequest = {
  id: string;
  clientId: string;
  professionalId: string;
  categoryId: string | null;
  descricao: string;
  endereco: string | null;
  dataAgendada: string | null;
  valorEstimado: string | null;
  status: ServiceRequestStatus;
  motivoCancelamento: string | null;
  createdAt: string;
  updatedAt: string;
  clienteNome?: string;
  profissionalNome?: string;
  categoriaNome?: string | null;
  payment?: Payment | null;
};

export type AvailabilitySlot = {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
};

export type CreateServiceRequestPayload = {
  professionalId: string;
  categoryId?: string;
  descricao: string;
  endereco?: string;
  dataAgendada?: string;
  valorEstimado?: number;
};

export type CartaoPayload = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  email: string;
  cep: string;
  numeroEndereco: string;
  telefone?: string;
};

export type CreatePaymentPayload = {
  valor: number;
  metodo: 'PIX' | 'CARTAO' | 'DINHEIRO';
  cpf?: string;
  cartao?: CartaoPayload;
};
