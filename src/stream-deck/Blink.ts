import { EventEmitter } from 'events';
export enum KeyBlinkSpeed {
  NONE = 0,
  LAZY = 2000,
  SLOW = 1000,
  MEDIUM = 700,
  FAST = 300,
}

class Blink extends EventEmitter {
  constructor() {
    super();
    let lazy = true;
    let slow = true;
    let medium = true;
    let fast = true;
    setInterval(
      () => this.emit(KeyBlinkSpeed.LAZY.toString(), (lazy = !lazy) || lazy),
      KeyBlinkSpeed.LAZY,
    );
    setInterval(
      () => this.emit(KeyBlinkSpeed.SLOW.toString(), (slow = !slow) || slow),
      KeyBlinkSpeed.SLOW,
    );
    setInterval(
      () =>
        this.emit(
          KeyBlinkSpeed.MEDIUM.toString(),
          (medium = !medium) || medium,
        ),
      KeyBlinkSpeed.MEDIUM,
    );
    setInterval(
      () => this.emit(KeyBlinkSpeed.FAST.toString(), (fast = !fast) || fast),
      KeyBlinkSpeed.FAST,
    );
  }
}

export default new Blink();
