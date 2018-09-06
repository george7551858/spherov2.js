import { IQueuePayload } from './core';
import { IToyAdvertisement } from './types';
import { RollableToy } from './rollable-toy';
export declare class R2D2 extends RollableToy {
    static advertisement: IToyAdvertisement;
    playAudioFile(idx: number): Promise<IQueuePayload>;
    enableCollisionDetection(): Promise<IQueuePayload>;
    configureCollisionDetection(xThreshold?: number, yThreshold?: number, xSpeed?: number, ySpeed?: number, deadTime?: number, method?: number): Promise<IQueuePayload>;
}
