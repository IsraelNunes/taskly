import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateClientProfileDto {
  @IsOptional()
  @IsBoolean()
  notificacoesAtivas?: boolean;
}
