import { Controller } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { StreamDeckService } from '../stream-deck/stream-deck.service';
import { Key, KeyBlinkSpeed } from '../stream-deck/Key';
@Controller('twitter')
export class TwitterController {
  tweetKey: Key;
  magikcraftKey: Key;
  zeebeKey: Key;
  brisjsKey: Key;
  constructor(
    private readonly twitterService: TwitterService,
    private readonly streamDeck: StreamDeckService,
  ) {
    this.register();
  }

  async tweet(status, key: Key) {
    this.twitterService.tweet(status);
    key.setState(1);
    setTimeout(() => key.setState(0), 3000);
  }

  async register() {
    this.brisjsKey = await this.streamDeck.registerKey({
      name: 'BrisJS',
      num: 7,
      layer: 0,
      handler: () =>
        this.tweet(
          `I'm streaming live from @BrisJS right now. Check it out: https://www.twitch.tv/thelegendaryjoshwulf`,
          this.brisjsKey,
        ),
      states: [
        {
          name: 'Tweet-BrisJS',
          imageFile: 'brisjs-key.png',
        },
      ],
    });
    this.tweetKey = await this.streamDeck.registerKey({
      name: 'Twitter',
      num: 9,
      layer: 0,
      handler: () =>
        this.tweet(
          `I'm coding live on Twitch.tv right now! Check it out: https://www.twitch.tv/thelegendaryjoshwulf`,
          this.tweetKey,
        ),
      states: [
        {
          name: 'Tweet',
          imageFile: 'tweet.png',
        },
        {
          name: 'Tweet',
          imageFile: 'tweet.png',
          blink: KeyBlinkSpeed.FAST,
        },
      ],
    });
    this.magikcraftKey = await this.streamDeck.registerKey({
      name: 'Twitter/Magikcraft',
      num: 7,
      layer: 0,
      handler: () =>
        this.tweet(
          `I'm coding #Minecraft with @magikcraft.io live on Twitch.tv right now! Check it out: https://www.twitch.tv/thelegendaryjoshwulf`,
          this.magikcraftKey,
        ),
      states: [
        {
          name: 'Tweet-Magikcraft',
          imageFile: 'magikcraft-tweet.png',
        },
        {
          name: 'Tweet-Magikcraft',
          imageFile: 'magikcraft-tweet.png',
          blink: KeyBlinkSpeed.FAST,
        },
      ],
    });
    this.zeebeKey = await this.streamDeck.registerKey({
      name: 'Twitter/Zeebe',
      num: 8,
      layer: 0,
      handler: () =>
        this.tweet(
          `I'm coding with @ZeebeHQ and #Nodejs live on Twitch.tv right now! Check it out: https://www.twitch.tv/thelegendaryjoshwulf`,
          this.zeebeKey,
        ),
      states: [
        {
          name: 'Tweet-Zeebe',
          imageFile: 'zeebe-tweet.png',
        },
        {
          name: 'Tweet-Zeebe',
          imageFile: 'zeebe-tweet.png',
          blink: KeyBlinkSpeed.FAST,
        },
      ],
    });
  }
}
