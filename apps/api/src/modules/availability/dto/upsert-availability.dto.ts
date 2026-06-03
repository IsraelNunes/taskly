import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';

export class AvailabilitySlotDto {
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana!: number;

  @IsString()
  horaInicio!: string;

  @IsString()
  horaFim!: string;

  @IsBoolean()
  ativo!: boolean;
}

export class UpsertAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots!: AvailabilitySlotDto[];
}
