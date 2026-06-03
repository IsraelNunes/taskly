import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('contratacoes/:requestId/pagamento')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('requestId') requestId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.service.create(requestId, user.sub, dto);
  }

  @Get()
  findOne(@CurrentUser() user: JwtPayload, @Param('requestId') requestId: string) {
    return this.service.findByServiceRequest(requestId, user.sub);
  }
}
