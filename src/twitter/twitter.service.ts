import { Injectable } from '@nestjs/common';
import Twitter = require('twitter');

@Injectable()
export class TwitterService {
  client: any;
  constructor() {
    try {
      const credentials = require('./twitter.credentials').credentials;
      this.client = new Twitter(credentials);
    } catch (e) {
      console.log('Twitter disabled - no credentials found.');
    }
  }
  tweet(status: string) {
    return new Promise(resolve =>
      this.client.post(
        'statuses/update',
        {
          status,
        },
        (error, tweet, response) => {
          if (!error) {
            // tslint:disable-next-line: no-console
            console.log('Tweeted!');
            return resolve();
          }
          // tslint:disable-next-line: no-console
          console.log(error);
          resolve();
        },
      ),
    );
  }
}
