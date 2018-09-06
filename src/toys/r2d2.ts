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

  public playAudioFile(idx: number) {
    return this.queueCommand(this.commands.userIo.playAudioFile(idx));
  }

  public enableCollisionDetection() {
    return this.queueCommand(this.commands.sensor.enableCollisionAsync());
  }

  public configureCollisionDetection(
    xThreshold: number = 100,
    yThreshold: number  = 100,
    xSpeed: number = 100,
    ySpeed: number = 100,
    deadTime: number = 10,
    method: number = 0x01) {
    return this.queueCommand(
      this.commands.sensor.configureCollision(xThreshold, yThreshold, xSpeed, ySpeed, deadTime, method),
    );
  }
}
