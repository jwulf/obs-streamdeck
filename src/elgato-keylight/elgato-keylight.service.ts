import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Bonjour = require('bonjour');
const bonjour = Bonjour();
import * as queue from 'async/queue';
// tslint:disable: no-console

const q = queue(async (task, callback) => {
  await task();
  callback();
}, 1);

@Injectable()
export class ElgatoKeylightService {
  address: any;
  constructor() {
    console.log('Searching for Elgato light'); // @DEBUG

    // Bonjour discovery idea from here:
    // https://git.dev.hellcat.net/users/hellcat/repos/twitch-lightbot/browse/src/lightbot/lightbot.go?at=refs%2Fheads%2Fdevelop#484
    // It's not reliable, in that implementation it is called twice, with a timer

    bonjour.find({ protocol: '_elg._tcp' }, (service: any) => {
      if (service.name.includes('Elgato Key Light')) {
        const address = `${service.host}:${service.port}`;
        // tslint:disable-next-line: no-console
        console.log('Found an Elgato Key Light:', address);
        // this.address = address;
      }
    });
    this.address = `http://${process.env.ELGATO_ADDRESS}`;

    this.getSettings().then(({ data }) => console.log(data));
  }

  async onOff() {
    let on;
    return new Promise(resolve =>
      q.push(
        async () => {
          const settings = await this.getSettings();
          const current = settings.data.lights[0];
          await axios.put(`${this.address}/elgato/lights`, {
            numberOfLights: 1,
            lights: [
              {
                brightness: current.brightness,
                temperature: current.temperature,
                on: !current.on,
              },
            ],
          });
          // tslint:disable-next-line: no-console
          console.log(`Light ${!current.on ? 'on' : 'off'}`); // @DEBUG
          on = !current.on ? 0 : 1;
        },
        () => resolve(on),
      ),
    );
  }

  async changeBrightness(inc: 1 | -1) {
    return new Promise(resolve =>
      q.push(
        async () => {
          const settings = await this.getSettings();
          const current = settings.data.lights[0];
          await axios.put(`${this.address}/elgato/lights`, {
            numberOfLights: 1,
            lights: [
              {
                brightness: current.brightness + inc,
                temperature: current.temperature,
                on: current.on,
              },
            ],
          });
          // tslint:disable-next-line: no-console
          console.log(`Brightness: ${current.brightness + inc}`); // @DEBUG
        },
        () => resolve(),
      ),
    );
  }

  async changeTemperature(inc: 5 | -5) {
    return new Promise(resolve =>
      q.push(
        async () => {
          // tslint:disable-next-line: no-console
          console.log(`Temperature:2`);
          const settings = await this.getSettings();
          const current = settings.data.lights[0];

          await axios.put(`${this.address}/elgato/lights`, {
            numberOfLights: 1,
            lights: [
              {
                brightness: current.brightness,
                temperature: current.temperature + inc,
                on: current.on,
              },
            ],
          });
          // tslint:disable-next-line: no-console
          console.log(`Temperature: ${current.temperature + inc}`); // @DEBUG
        },
        () => resolve(),
      ),
    );
  }

  private getSettings() {
    const settings = axios.get(`${this.address}/elgato/lights`);
    return settings;
  }
}
