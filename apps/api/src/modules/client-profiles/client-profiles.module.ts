import { Module } from '@nestjs/common';
import { ClientProfilesController } from './client-profiles.controller';
import { ClientProfilesService } from './client-profiles.service';

@Module({
  controllers: [ClientProfilesController],
  providers: [ClientProfilesService],
  exports: [ClientProfilesService],
})
export class ClientProfilesModule {}
