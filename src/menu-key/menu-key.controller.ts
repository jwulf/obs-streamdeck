import { Controller } from '@nestjs/common';
import { KeyBlinkSpeed } from '../stream-deck/Key';
import { StreamDeckService } from '../stream-deck/stream-deck.service';

@Controller('menu-key')
export class MenuKeyController {
  constructor(private readonly streamDeck: StreamDeckService) {
    this.streamDeck.registerKey({
      num: 0,
      name: 'LAYER_HOME',
      layer: 0,
      handler: async () => this.streamDeck.activateLayer(1),
      states: [
        {
          name: 'MAIN_MENU',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'zeebe.png',
        },
      ],
    });

    this.streamDeck.registerKey({
      num: 0,
      name: 'LAYER_HOME',
      layer: 1,
      handler: async () => this.streamDeck.activateLayer(0),
      states: [
        {
          name: 'MAIN_MENU',
          blink: KeyBlinkSpeed.NONE,
          imageFile: 'zeebe.png',
        },
      ],
    });
  }
}
