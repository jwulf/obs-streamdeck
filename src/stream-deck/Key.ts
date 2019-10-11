import { StreamDeckService } from '../stream-deck/stream-deck.service';
import Blink, { KeyBlinkSpeed } from './Blink';
export { KeyBlinkSpeed } from './Blink';
import * as queue from 'async/queue';
import delay = require('delay');

export interface KeyState {
  name: string;
  imageFile: string;
  blink?: KeyBlinkSpeed;
}

const q = queue(async (task, callback) => {
  await task();
  callback();
}, 1);

export type KeyPressHandler = (
  state: number,
) => Promise<number | undefined | unknown>;
export class Key {
  imageFile: string;
  image: Buffer;
  num: number;
  streamDeckService: StreamDeckService;
  states: Array<KeyState & { image?: Buffer }>;
  state: any;
  syncState: any;
  handler: KeyPressHandler;
  keyPressed: boolean;
  repeat: boolean;
  layer: number;
  render: (image: any) => void;
  clear: () => void;
  flash: any;
  name: any;
  constructor({
    render,
    clear,
    states,
    syncState,
    layer,
    num,
    repeat,
    handler,
    name,
  }: {
    render: (image) => void;
    clear: () => void;
    states: KeyState[];
    syncState?: () => Promise<any>;
    layer: number;
    num: number;
    repeat?: true;
    name: string;
    handler: KeyPressHandler;
  }) {
    this.num = num;
    this.name = name;
    this.syncState = syncState;
    this.handler = handler;
    this.repeat = repeat;
    this.layer = layer;
    this.states = states;
    this.render = render;
    this.clear = clear;
    this.flash = i =>
      i ? this.render(this.states[this.state].image) : this.clear();

    setTimeout(() => this.init(), 100);
  }

  async init() {
    const initialState = this.syncState ? await this.syncState() : 0;
    this.state = -1; // force render
    this.setState(initialState);
  }
  setState(newState) {
    q.push(async () => {
      this.renderState(this.state, newState);
      this.state = newState;
      await delay(50);
    });
  }

  nextState() {
    this.setState(this.state++ % this.states.length);
  }

  async keyDown() {
    this.keyPressed = true;
    await this.doAction();
    if (this.repeat) {
      await this.repeatLoop();
    }
  }

  async keyUp() {
    this.keyPressed = false;
  }

  private async doAction() {
    this.setState((await this.handler(this.state)) || 0);
  }

  private async repeatLoop() {
    if (this.repeat && this.keyPressed) {
      return new Promise(resolve => {
        setTimeout(async () => {
          await this.doAction();
          await this.repeatLoop();
          resolve();
        }, 50);
      });
    }
  }

  private renderState(state, newState) {
    if (newState === undefined || state === newState) {
      return;
    }
    if (!this.states[newState] || !this.states[newState].image) {
      // tslint:disable-next-line: no-console
      console.log(`No image for ${this.name} state ${newState}`); // @DEBUG
      return;
    }

    this.render(this.states[newState].image!);
    this.blink(this.states[newState].blink || KeyBlinkSpeed.NONE);
  }

  private blink(speed: KeyBlinkSpeed = KeyBlinkSpeed.MEDIUM) {
    Blink.removeListener(KeyBlinkSpeed.LAZY.toString(), this.flash);
    Blink.removeListener(KeyBlinkSpeed.SLOW.toString(), this.flash);
    Blink.removeListener(KeyBlinkSpeed.MEDIUM.toString(), this.flash);
    Blink.removeListener(KeyBlinkSpeed.FAST.toString(), this.flash);

    if (speed === KeyBlinkSpeed.NONE) {
      return;
    }
    Blink.on(speed.toString(), this.flash);
  }
}
