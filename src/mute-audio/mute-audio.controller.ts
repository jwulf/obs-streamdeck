import { Controller } from '@nestjs/common';
import { ObsService } from '../obs/obs.service';
import { StreamDeckService } from '../stream-deck/stream-deck.service';
import { Key, KeyBlinkSpeed } from '../stream-deck/Key';

export enum AudioState {
  OFF = 0,
  ON = 1,
  ERR = 2,
}

@Controller('mute-audio')
export class MuteAudioController {
  key: Key;
  SOURCE: string;
  constructor(
    private readonly streamDeck: StreamDeckService,
    private readonly obs: ObsService,
  ) {
    this.SOURCE = process.env.AUDIO_SOURCE;
    this.register();
  }

  private async register() {
    // tslint:disable-next-line: no-console
    console.log({ source: this.SOURCE }); // @DEBUG
    this.key = await this.streamDeck.registerKey({
      num: 2,
      name: 'Mute Audio',
      layer: 0,
      syncState: async () => this.sync(),
      handler: () => this.keyPress(),
      states: [
        {
          name: 'SOUND_OFF',
          blink: KeyBlinkSpeed.MEDIUM,
          imageFile: 'mic-off.png',
        },
        {
          name: 'SOUND_ON',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'mic-off.png',
        },
        {
          name: 'OBS_NOT_FOUND',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'obs-not-found.png',
        },
      ],
    });
    this.obs.on('Reconnected', async () =>
      this.key.setState(await this.sync()),
    );
    this.obs.on('Disconnected', () => {
      this.key.setState(AudioState.ERR);
    });
    this.obs.on('AudioChange', data => {
      if (data.sourceName !== this.SOURCE) {
        return;
      }
      this.key.setState(data.muted ? AudioState.OFF : AudioState.ON);
    });
  }

  async keyPress() {
    this.obs.toggleMute(this.SOURCE);
    return undefined;
  }

  private async sync() {
    {
      const [Err, s] = await this.obs.getMute(this.SOURCE);
      if (Err) {
        return this.key.setState(AudioState.ERR);
      }
      return s.muted ? AudioState.OFF : AudioState.ON;
    }
  }
}
