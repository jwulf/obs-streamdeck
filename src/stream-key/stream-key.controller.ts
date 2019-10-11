import { Controller } from '@nestjs/common';
import { StreamDeckService } from '../stream-deck/stream-deck.service';
import { ObsService, OBSStreamState } from '../obs/obs.service';
import { KeyBlinkSpeed, Key } from '../stream-deck/Key';

export enum StreamState {
  STOPPED = 0,
  STARTED = 1,
  ERR = 2,
  STARTING = 3,
  STOPPING = 4,
}
@Controller()
export class StreamKeyController {
  key: Key;

  constructor(
    private readonly streamDeck: StreamDeckService,
    private readonly obs: ObsService,
  ) {
    this.register();
    this.obs.on('Change', (state: OBSStreamState) => {
      this.key.setState(StreamState[state]);
    });
    setInterval(async () => {
      if (!this.obs.connected) {
        return this.key.setState(StreamState.ERR);
      }
    }, 1000);
  }

  private async register() {
    this.key = await this.streamDeck.registerKey({
      num: 4,
      name: 'Stream Start/Stop',
      layer: 0,
      syncState: async () => StreamState[this.obs.streamState],
      handler: () => this.keyPress(),
      states: [
        {
          name: 'STREAM_OFF',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'stream-off.png',
        },
        {
          name: 'STREAM_ON',
          blink: KeyBlinkSpeed.MEDIUM,
          imageFile: 'stream-on.png',
        },
        {
          name: 'OBS_NOT_FOUND',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'obs-not-found.png',
        },
        {
          name: 'STARTING',
          blink: KeyBlinkSpeed.FAST,
          imageFile: 'stream-off.png',
        },
        {
          name: 'STOPPING',
          blink: KeyBlinkSpeed.FAST,
          imageFile: 'stream-on.png',
        },
      ],
    });
    this.obs.on('Reconnected', async () =>
      this.key.setState(StreamState[this.obs.streamState]),
    );
    this.obs.on('Disconnected', () => this.key.setState(StreamState.ERR));
  }

  async keyPress() {
    this.obs.startStopStreaming();
    return StreamState[this.obs.streamState]
  }
}
