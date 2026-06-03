import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AvailabilityService } from './availability.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@Controller('disponibilidade')
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.service.findByUserId(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpsertAvailabilityDto) {
    return this.service.upsert(user.sub, dto);
  }

  @Get(':userId')
  getPublic(@Param('userId') userId: string) {
    return this.service.findByUserId(userId);
  }
}
