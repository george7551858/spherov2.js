"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rollable_toy_1 = require("./rollable-toy");
class R2D2 extends rollable_toy_1.RollableToy {
    playAudioFile(idx) {
        return this.queueCommand(this.commands.userIo.playAudioFile(idx));
    }
    enableCollisionDetection() {
        return this.queueCommand(this.commands.sensor.enableCollisionAsync());
    }
    configureCollisionDetection(xThreshold = 100, yThreshold = 100, xSpeed = 100, ySpeed = 100, deadTime = 10, method = 0x01) {
        return this.queueCommand(this.commands.sensor.configureCollision(xThreshold, yThreshold, xSpeed, ySpeed, deadTime, method));
    }
}
R2D2.advertisement = {
    name: 'R2-D2',
    prefix: 'D2-',
    class: R2D2,
};
exports.R2D2 = R2D2;
