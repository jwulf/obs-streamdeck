import { Controller } from '@nestjs/common';
import { ElgatoKeylightService } from './elgato-keylight.service';
import { StreamDeckService } from '../stream-deck/stream-deck.service';
import { KeyBlinkSpeed } from '../stream-deck/Key';

@Controller('elgato-keylight')
export class ElgatoKeylightController {
  constructor(
    private readonly elgatoKeylight: ElgatoKeylightService,
    private readonly streamDeck: StreamDeckService,
  ) {
    this.streamDeck.registerKey({
      num: 10,
      name: 'LIGHT_ON_OFF',
      layer: 0,
      handler: () => this.elgatoKeylight.onOff(),
      states: [
        {
          name: 'LIGHT_OFF',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'light-on.png',
        },
        {
          name: 'LIGHT_ON',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'light-off.png',
        },
      ],
    });
    this.streamDeck.registerKey({
      num: 11,
      name: 'LIGHT_BRIGHT_DOWN',
      layer: 0,
      repeat: true,
      handler: () => this.elgatoKeylight.changeBrightness(-1),
      states: [
        {
          name: 'LIGHT_DOWN',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'light-down.png',
        },
      ],
    });
    this.streamDeck.registerKey({
      num: 12,
      name: 'LIGHT_BRIGHT_UP',
      layer: 0,
      repeat: true,
      handler: () => this.elgatoKeylight.changeBrightness(1),
      states: [
        {
          name: 'LIGHT_UP',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'light-up.png',
        },
      ],
    });
    this.streamDeck.registerKey({
      num: 13,
      name: 'LIGHT_TEMP_DOWN',
      layer: 0,
      repeat: true,
      handler: () => this.elgatoKeylight.changeTemperature(-5),
      states: [
        {
          name: 'LIGHT_TEMP_DOWN',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'light-temp-down.png',
        },
      ],
    });
    this.streamDeck.registerKey({
      num: 14,
      name: 'LIGHT_TEMP_UP',
      layer: 0,
      repeat: true,
      handler: () => this.elgatoKeylight.changeTemperature(5),
      states: [
        {
          name: 'LIGHT_TEMP_UP',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'light-temp-up.png',
        },
      ],
    });
  }
}
