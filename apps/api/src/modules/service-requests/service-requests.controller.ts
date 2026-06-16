import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CancelServiceRequestDto } from './dto/cancel-service-request.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ServiceRequestsService } from './service-requests.service';

@Controller('contratacoes')
@UseGuards(JwtAuthGuard)
export class ServiceRequestsController {
  constructor(private readonly service: ServiceRequestsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateServiceRequestDto) {
    return this.service.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.service.findAll(user.sub, user.perfil);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(id, user.sub);
  }

  @Patch(':id/confirmar')
  confirmar(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.confirmar(id, user.sub);
  }

  @Patch(':id/iniciar')
  iniciar(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.iniciar(id, user.sub);
  }

  @Patch(':id/concluir')
  concluir(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.concluir(id, user.sub);
  }

  @Patch(':id/cancelar')
  cancelar(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelServiceRequestDto,
  ) {
    return this.service.cancelar(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.remove(id, user.sub);
  }
}
