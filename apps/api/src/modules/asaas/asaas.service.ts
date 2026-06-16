import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../../config/env.schema';

interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
}

interface AsaasPayment {
  id: string;
  status: string;
  billingType: string;
  value: number;
}

interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface CreateCustomerData {
  name: string;
  cpfCnpj: string;
  email?: string;
  mobilePhone?: string;
}

interface CreatePixPaymentData {
  customerId: string;
  value: number;
  description: string;
  dueDate: string;
}

interface CreateCreditCardPaymentData {
  customerId: string;
  value: number;
  description: string;
  dueDate: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    cpfCnpj: string;
    email: string;
    mobilePhone: string;
    postalCode: string;
    addressNumber: string;
  };
  remoteIp: string;
}

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService<EnvSchema, true>) {
    const env = this.config.get('ASAAS_ENVIRONMENT', { infer: true });
    this.baseUrl =
      env === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/api/v3';
    this.apiKey = this.config.get('ASAAS_API_KEY', { infer: true });
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        access_token: this.apiKey,
        ...(options.headers ?? {}),
      },
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      this.logger.error(`Asaas API error [${response.status}] ${path}: ${text}`);
      throw new InternalServerErrorException(`Erro no gateway de pagamento: ${response.status}`);
    }

    return data as T;
  }

  async createCustomer(data: CreateCustomerData): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
        email: data.email,
        mobilePhone: data.mobilePhone?.replace(/\D/g, ''),
      }),
    });
  }

  async createPixPayment(data: CreatePixPaymentData): Promise<AsaasPayment> {
    return this.request<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: data.customerId,
        billingType: 'PIX',
        value: data.value,
        description: data.description,
        dueDate: data.dueDate,
      }),
    });
  }

  async getPixQrCode(asaasPaymentId: string): Promise<AsaasPixQrCode> {
    return this.request<AsaasPixQrCode>(`/payments/${asaasPaymentId}/pixQrCode`);
  }

  async createCreditCardPayment(data: CreateCreditCardPaymentData): Promise<AsaasPayment> {
    return this.request<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: data.customerId,
        billingType: 'CREDIT_CARD',
        value: data.value,
        description: data.description,
        dueDate: data.dueDate,
        creditCard: data.creditCard,
        creditCardHolderInfo: {
          ...data.creditCardHolderInfo,
          cpfCnpj: data.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ''),
          postalCode: data.creditCardHolderInfo.postalCode.replace(/\D/g, ''),
          mobilePhone: data.creditCardHolderInfo.mobilePhone.replace(/\D/g, ''),
        },
        remoteIp: data.remoteIp,
      }),
    });
  }
}
