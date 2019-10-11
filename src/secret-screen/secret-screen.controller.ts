import { Injectable, Controller } from '@nestjs/common';
import { ObsService } from '../obs/obs.service';
import notifier = require('node-notifier');
import { Key, KeyBlinkSpeed } from '../stream-deck/Key';
import { StreamDeckService } from '../stream-deck/stream-deck.service';

const SecretSceneName = 'Secret';
const SecretItem = 'Secret-Image';

export enum SecretScreenState {
  OFF = 0,
  ON = 1,
  ERR = 2,
}
@Controller()
export class SecretScreenController {
  key: Key;

  constructor(
    private readonly streamDeck: StreamDeckService,
    private readonly obs: ObsService,
  ) {
    this.register();
    setInterval(async () => this.key.setState(await this.sync()), 1000);
  }

  private async register() {
    this.key = await this.streamDeck.registerKey({
      num: 1,
      name: 'SECRET_SCREEN',
      layer: 0,
      syncState: async () => this.sync(),
      handler: () => this.keyPress(),
      states: [
        {
          name: 'SECRET_SCREEN_OFF',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'secret-key.png',
        },
        {
          name: 'SECRET_SCREEN_ON',
          blink: KeyBlinkSpeed.MEDIUM,
          imageFile: 'secret-key.png',
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
      this.key.setState(SecretScreenState.ERR);
    });
  }

  async keyPress() {
    const [Err, s] = await this.obs.getSceneItemProperties({
      sceneName: SecretSceneName,
      item: SecretItem,
    });

    if (Err) {
      return;
    }
    const secretScreenOn = !s.visible;

    this.obs.setSceneItemProperties({
      sceneName: SecretSceneName,
      item: SecretItem,
      visible: secretScreenOn,
    });

    // tslint:disable-next-line: no-console
    console.log(`Secret screen ${secretScreenOn ? 'on' : 'off'}`);

    return secretScreenOn ? SecretScreenState.ON : SecretScreenState.OFF;
  }

  private async sync() {
    {
      const [Err, s] = await this.obs.getSceneItemProperties({
        sceneName: SecretSceneName,
        item: SecretItem,
      });
      if (Err) {
        return 2;
      }
      return s.visible ? SecretScreenState.ON : SecretScreenState.OFF;
    }
  }
}
