import { IQueuePayload } from './core';
import { IToyAdvertisement } from './types';
import { RollableToy } from './rollable-toy';
export declare class R2D2 extends RollableToy {
    static advertisement: IToyAdvertisement;
    playAudioFile(idx: number): Promise<IQueuePayload>;
}
