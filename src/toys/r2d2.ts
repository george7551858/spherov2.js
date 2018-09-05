// tslint:disable-next-line:no-unused-variable
import { Core, IQueuePayload } from './core';
import { IToyAdvertisement } from './types';
import { RollableToy } from './rollable-toy';

export class R2D2 extends RollableToy {
  public static advertisement: IToyAdvertisement = {
    name: 'R2-D2',
    prefix: 'D2-',
    class: R2D2,
  };

  public playAudioFile(payload: number[]) {
    return this.queueCommand(this.commands.userIo.playAudioFile(payload));
  }
}
