import { Injectable } from '@nestjs/common';
import { openStreamDeck } from 'elgato-stream-deck';
import * as sharp from 'sharp'; // See http://sharp.dimens.io/en/stable/ for full docs on this great library!
import { resolve } from 'path';
import { Key, KeyState, KeyPressHandler } from './Key';
import * as queue from 'async/queue';

const q = queue(async (task, callback) => {
  await task();
  callback();
}, 1);

@Injectable()
export class StreamDeckService {
  ICON_SIZE: any;
  streamDeck;
  handlers: any = {};
  layers = {};
  currentLayer = 0;

  constructor() {
    this.streamDeck = openStreamDeck();
    this.streamDeck.clearAllKeys();
    this.ICON_SIZE = this.streamDeck.ICON_SIZE;
    this.streamDeck.on('down', keyIndex =>
      this.layers[this.currentLayer]?.[keyIndex]?.keyDown(),
    );
    this.streamDeck.on('up', keyIndex =>
      this.layers[this.currentLayer]?.[keyIndex]?.keyUp(),
    );
    this.streamDeck.on('error', error => {
      console.error(error);
    });
    this.activateLayer(0);
  }

  async registerKey({
    num,
    repeat,
    layer,
    syncState,
    handler,
    states,
    name,
  }: {
    num: number;
    repeat?: true;
    layer: number;
    handler: KeyPressHandler;
    syncState?: () => Promise<any>;
    states: KeyState[];
    name: string;
  }) {
    return this.prerenderStates(states).then(renderedStates => {
      const key = new Key({
        states: renderedStates,
        num,
        syncState,
        repeat,
        layer,
        name,
        render: this.renderKeyFn(this, num, layer),
        clear: this.clearKeyFn(this, num, layer),
        handler,
      });
      this.layers[layer] = this.layers[layer] || {};
      this.layers[layer][num] = key;
      return key;
    });
  }

  activateLayer(newLayer: number) {
    const keys = Array.from(Array(15).keys());
    keys.forEach(k => this.streamDeck.clearKey(k));
    this.currentLayer = newLayer;
    keys.forEach(k => this.layers[newLayer]?.[k]?.init?.());
    return newLayer;
  }

  private async prerenderStates(states: KeyState[]) {
    return Promise.all(
      states.map(s =>
        this.prerenderKeyImage(s.imageFile).then(image => ({ image, ...s })),
      ),
    );
  }

  private async prerenderKeyImage(imageFile: string) {
    const file = resolve(__dirname, '..', '..', 'images', imageFile);
    return sharp(file)
      .flatten() // Eliminate alpha channel, if any.
      .resize(this.streamDeck.ICON_SIZE, this.streamDeck.ICON_SIZE) // Scale up/down to the right size, cropping if necessary.
      .raw() // Give us uncompressed RGB.
      .toBuffer();
  }

  private renderKeyFn = (that, num, layer) => {
    return image => {
      if (layer === this.currentLayer) {
        q.push(() => {
          try {
            that.streamDeck.fillImage(num, image);
          } catch (_) {
            that.streamDeck.fillImage(num, image); // Retry
          }
        });
      }
    };
  };

  private clearKeyFn = (that, num, layer) => {
    return () => {
      if (layer === this.currentLayer) {
        q.push(() => that.streamDeck.clearKey(num));
      }
    };
  };
}
