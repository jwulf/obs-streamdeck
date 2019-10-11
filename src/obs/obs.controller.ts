import { Controller } from '@nestjs/common';
import { StreamDeckService } from '../stream-deck/stream-deck.service';
import { KeyBlinkSpeed } from '../stream-deck/Key';
import { exec } from 'child_process';
import { ObsService } from './obs.service';

@Controller('obs')
export class ObsController {
  key: any;
  checkloop: NodeJS.Timeout;
  constructor(
    private readonly streamDeck: StreamDeckService,
    private readonly obs: ObsService,
  ) {
    this.register(streamDeck);
    this.check();
  }

  private check() {
    this.checkloop = setInterval(async () => {
      this.key.setState(this.obs.connected ? 1 : 0);
    }, 1500);
  }

  private async register(streamDeck) {
    this.key = await streamDeck.registerKey({
      num: 5,
      name: 'Start OBS',
      layer: 0,
      syncState: async () => (this.obs.isRunning ? 1 : 0),
      handler: async state => {
        if (state === 0) {
          const isObsRunning = this.obs.isRunning;

          if (!isObsRunning) {
            // tslint:disable-next-line: no-console
            console.log('Launching OBS'); // @DEBUG
            clearInterval(this.checkloop);
            this.key.setState(2);
            this.startObs();
            setTimeout(() => this.check(), 1500);
            return 2;
          }

          return 1;
        }
        // tslint:disable-next-line: no-console
        console.log('OBS Button pressed', state); // @DEBUG
        return (state + 1) % 2;
      },
      states: [
        {
          imageFile: 'obs.png',
          name: 'OBS_START',
          blink: KeyBlinkSpeed.NONE,
        },
        {
          imageFile: 'obs-active.png',
          name: 'OBS_STARTED',
          blink: KeyBlinkSpeed.NONE,
        },
        {
          imageFile: 'obs-active.png',
          name: 'OBS_STARTING',
          blink: KeyBlinkSpeed.FAST,
        },
      ],
    });
    this.obs.on('Disconnected', () => this.key.setState(0));
  }

  private startObs() {
    exec('./start-obs.sh');
  }
}
