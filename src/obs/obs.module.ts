import { Module } from '@nestjs/common';
import { ObsService } from './obs.service';

@Module({
  exports: [ObsService],
  providers: [ObsService],
})
export class ObsModule {}
