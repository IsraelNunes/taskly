import { Module } from '@nestjs/common';
import { UfsController } from './ufs.controller';
import { UfsService } from './ufs.service';

@Module({
  controllers: [UfsController],
  providers: [UfsService],
  exports: [UfsService],
})
export class UfsModule {}
