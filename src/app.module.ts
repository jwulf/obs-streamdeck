import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SecretScreenController } from './secret-screen/secret-screen.controller';
import { StreamDeckService } from './stream-deck/stream-deck.service';
import { ObsService } from './obs/obs.service';
import { StreamKeyController } from './stream-key/stream-key.controller';
import { ElgatoKeylightService } from './elgato-keylight/elgato-keylight.service';
import { ElgatoKeylightController } from './elgato-keylight/elgato-keylight.controller';
import { MuteAudioController } from './mute-audio/mute-audio.controller';
import { MenuKeyController } from './menu-key/menu-key.controller';
import { ObsController } from './obs/obs.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    SecretScreenController,
    ElgatoKeylightController,
    MuteAudioController,
    StreamKeyController,
    MenuKeyController,
    ObsController,
  ],
  providers: [
    AppService,
    SecretScreenController,
    StreamDeckService,
    ObsService,
    ElgatoKeylightService,
  ],
})
export class AppModule {}
