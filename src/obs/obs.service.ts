import { Injectable } from '@nestjs/common';
import OBSWebSocket = require('obs-websocket-js');
import { EventEmitter } from 'events';
import * as utils from 'util';
// tslint:disable-next-line: no-var-requires
const ps = utils.promisify(require('ps-node'));
import * as pslist from 'ps-list';

export enum OBSStreamState {
  STARTING = 'STARTING',
  STARTED = 'STARTED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
}
// tslint:disable: no-console
@Injectable()
export class ObsService extends EventEmitter {
  private obs: OBSWebSocket;
  connected: boolean;
  isRunning: boolean = false;
  isStreaming: boolean = false;
  streamState = OBSStreamState.STOPPED;
  constructor() {
    super();
    this.obs = new OBSWebSocket();
    this.streamState = OBSStreamState.STOPPED;
    this.obs.on('ConnectionClosed', () => {
      this.connected = false;
      this.emit('Disconnected');
      // tslint:disable-next-line: no-console
      console.log('Emit disconnected'); // @DEBUG
    });
    this.obs.on('StreamStarting', () => {
      this.streamState = OBSStreamState.STARTING;
      this.emit('Change', this.streamState);
    });
    this.obs.on('StreamStarted', () => {
      this.streamState = OBSStreamState.STARTED;
      this.emit('Change', this.streamState);
    });
    this.obs.on('StreamStopping', () => {
      this.streamState = OBSStreamState.STOPPING;
      this.emit('Change', this.streamState);
    });
    this.obs.on('StreamStopped', () => {
      this.streamState = OBSStreamState.STOPPED;
      this.emit('Change', this.streamState);
    });
    this.obs.on('SourceMuteStateChanged', data =>
      this.emit('AudioChange', data),
    );
    this.connect();

    setInterval(async () => {
      this.isRunning = await this.isObsRunning();
      if (this.isRunning && !this.connected) {
        this.connect();
      }
    }, 1000);
  }

  private connect() {
    this.obs
      .connect({
        address: 'localhost:4444',
        password: process.env.OBS_PASSWORD,
      })
      .then(async () => {
        this.connected = true;
        console.log('Connected to OBS via websocket');
        const [Err, r] = await this.getStreamingStatus();
        if (!Err) {
          this.streamState = r.streaming
            ? OBSStreamState.STARTED
            : OBSStreamState.STOPPED;
          this.emit('Change', this.streamState);
          this.emit('Reconnected');
        }
      })
      .catch(e => console.log('Cannot connect to OBS'));
  }

  getSceneItemProperties({
    sceneName,
    item,
  }: {
    sceneName: string;
    item: string;
  }) {
    return this.obs
      .send('GetSceneItemProperties', {
        'scene-name': sceneName,
        item,
      })
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  setSceneItemProperties({
    sceneName,
    item,
    visible,
  }: {
    sceneName: string;
    item: string;
    visible?: boolean;
  }) {
    return this.obs
      .send('SetSceneItemProperties', {
        'scene-name': sceneName,
        item,
        visible,
      } as any)
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  startStreaming() {
    return this.obs
      .send('StartStreaming', {})
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  stopStreaming() {
    this.obs
      .send('StopStreaming')
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  getStreamingStatus() {
    return this.obs
      .send('GetStreamingStatus')
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  startStopStreaming() {
    return this.obs
      .send('StartStopStreaming')
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  getMute(source: string) {
    return this.obs
      .send('GetMute', {
        source,
      })
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  setMute({ source, mute }: { source: string; mute: boolean }) {
    return this.obs
      .send('SetMute', {
        source,
        mute,
      })
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  toggleMute(source) {
    return this.obs
      .send('ToggleMute', { source })
      .then(r => [null, r])
      .catch(e => [e, null]);
  }

  private async isObsRunning() {
    // const OBSBinary = `/Applications/OBS.app/Contents/MacOS/obs`.toLocaleLowerCase();
    const proc = await ps({ command: `\.\/obs\n` });
    const independentlyStarted = await pslist();
    const runningProcess = independentlyStarted.filter(p => p.name === 'obs');
    const obsRunning = proc.includes('./obs\n') || runningProcess?.length > 0;
    return obsRunning;
  }
}
