import { IsOptional, IsString } from 'class-validator';

export class CancelServiceRequestDto {
  @IsString()
  @IsOptional()
  motivoCancelamento?: string;
}
