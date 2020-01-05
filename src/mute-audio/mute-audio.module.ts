import { Module } from '@nestjs/common';
import { ObsModule } from '../obs/obs.module';

@Module({
  imports: [ObsModule],
})
export class MuteAudioModule {}
