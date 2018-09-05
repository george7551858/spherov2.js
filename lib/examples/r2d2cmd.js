"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const r2d2_1 = require("../toys/r2d2");
const utils_1 = require("../utils");
const scanner_1 = require("./lib/scanner");
const express = require("express");
const url = require("url");
const app = express();
const router = express.Router();
const port = 3000;
const helloMsg = `<pre>

Hello R2D2

</pre>`;
// url: http://localhost:3000/
app.get('/', (request, response) => response.send(helloMsg));
// all routes prefixed with /r2d2
app.use('/r2d2', router);
// set the server to listen on port 3000
// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
const setLedColor = (toy, color = {}, position = 'all') => {
    toy.wake();
    if (position !== 'back') {
        // front LED control
        toy.allLEDsRaw([0x00, 0x01, color.r]); // red
        toy.allLEDsRaw([0x00, 0x02, color.g]); // green
        toy.allLEDsRaw([0x00, 0x04, color.b]); // blue
    }
    if (position !== 'front') {
        // back LED control
        toy.setMainLedColor(color.r, color.g, color.b);
    }
};
const globalSpeed = 255;
let globalOffset = 0;
// SORRY FOR THIS CODE, It is my playground for now
const cmdPlay = (toy) => {
    let pressTimeout;
    let heading = 0;
    let currentSpeed = 0;
    let speed = globalSpeed;
    let executing = true;
    let calibrating = false;
    const cancelPress = () => {
        clearTimeout(pressTimeout);
        pressTimeout = null;
    };
    const addTimeout = () => {
        pressTimeout = setTimeout(() => {
            currentSpeed = 0;
        }, 500);
    };
    const loop = async () => {
        while (true) {
            if (executing) {
                toy.roll(currentSpeed, calibrating ? heading : (heading + globalOffset) % 360, []);
            }
            if (currentSpeed === 0 && !calibrating) {
                executing = false;
            }
            if (calibrating) {
                heading += 5;
                if (heading > 360) {
                    heading = 0;
                }
            }
            await utils_1.wait(100);
        }
    };
    const handle = async (key = '', symbol = {}) => {
        cancelPress();
        if (symbol.name === 'up') {
            heading = 0;
            currentSpeed = speed;
            executing = true;
            addTimeout();
        }
        else if (symbol.name === 'left') {
            heading = 270;
            currentSpeed = speed;
            executing = true;
            addTimeout();
        }
        else if (symbol.name === 'right') {
            heading = 90;
            currentSpeed = speed;
            executing = true;
            addTimeout();
        }
        else if (symbol.name === 'down') {
            heading = 180;
            currentSpeed = speed;
            executing = true;
            addTimeout();
        }
        if (key === 'q') {
            speed += 10;
            // console.log('speed', speed);
        }
        else if (key === 'z') {
            speed -= 10;
            // console.log('speed', speed);
        }
        else if (key === 'p') {
            process.exit();
        }
        else if (key === 's') {
            toy.sleep();
        }
        else if (key === 'a') {
            toy.wake();
        }
        else if (key === '1') {
            toy.playAudioFile(1);
        }
        else if (key === '2') {
            toy.playAudioFile(2);
        }
        else if (key === '3') {
            toy.playAudioFile(3);
        }
        else if (key === '4') {
            toy.playAudioFile(4);
        }
        else if (key === '5') {
            toy.playAudioFile(11);
        }
        else if (key === '6') {
            toy.playAudioFile(12);
        }
        else if (key === '7') {
            toy.playAudioFile(7);
        }
        else if (key === '8') {
            toy.playAudioFile(8);
        }
        else if (key === '9') {
            toy.playAudioFile(14);
        }
        else if (key === '0') {
            toy.playAudioFile(15);
        }
        else if (key === 'c') {
            if (calibrating) {
                calibrating = false;
                await toy.setBackLedIntensity(0);
                globalOffset = heading;
                heading = 0;
            }
            else {
                await toy.setBackLedIntensity(255);
                currentSpeed = 0;
                executing = true;
                heading = 0;
                calibrating = true;
            }
        }
    };
    const readline = require('readline');
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', handle);
    loop();
};
const apiRun = (toy) => {
    router.get('/', async (request, response) => {
        response.json({
            name: r2d2_1.R2D2.advertisement.name,
            appVersion: await toy.appVersion(),
            batteryVoltage: await toy.batteryVoltage(),
        });
    });
    router.get('/move/:move', async (request, response) => {
        const query = url.parse(request.url, true).query;
        let heading = +query.h || 0;
        let speed = +query.s || 0;
        switch (request.params.move) {
            case 'up':
                heading = 0;
                speed = globalSpeed;
                break;
            case 'down':
                heading = 180;
                speed = globalSpeed;
                break;
            case 'left':
                heading = 270;
                speed = globalSpeed;
                break;
            case 'right':
                heading = 90;
                speed = globalSpeed;
                break;
            default:
                break;
        }
        // tslint:disable-next-line:no-console
        console.log(query, request.params, heading, speed);
        toy.wake();
        toy.playAudioFile(8);
        toy.roll(0, (heading + globalOffset) % 360, []);
        await utils_1.wait(500);
        toy.roll(speed, (heading + globalOffset) % 360, []);
        response.end();
    });
    router.get('/led/:position/:color', async (request, response) => {
        const query = url.parse(request.url, true).query;
        let r = +query.r || 0;
        let g = +query.g || 0;
        let b = +query.b || 0;
        switch (request.params.color) {
            case 'red':
                r = 0xFF;
                break;
            case 'green':
                g = 0xFF;
                break;
            case 'blue':
                b = 0xFF;
                break;
            case 'white':
                r = g = b = 0xFF;
                break;
            default:
                break;
        }
        // tslint:disable-next-line:no-console
        console.log(query, request.params, r, g, b);
        let color = { r, g, b };
        if (request.params.color === 'flashing') {
            if (r === 0 && g === 0 && b === 0) {
                color = { r: 0xFF, g: 0, b: 0 };
            }
            let counter = Math.floor(+query.second * 5) || 10;
            while (counter--) {
                const WAIT_TIME = 100;
                setLedColor(toy, color, request.params.position);
                await utils_1.wait(WAIT_TIME);
                setLedColor(toy, { r: 0, g: 0, b: 0 }, request.params.position);
                await utils_1.wait(WAIT_TIME);
            }
        }
        else {
            setLedColor(toy, color, request.params.position);
        }
        response.end();
    });
    router.get('/play/:idx', async (request, response) => {
        let idxString = request.params.idx;
        toy.wake();
        switch (idxString) {
            case 'ok':
                idxString = '14,,,,,,,14,,,,,,,14,,,,,,,14,,,,,,14,,,,,14,,,,14,,,14,,14,14,14,14,14,14,14,14,14,14';
                break;
            case 'failed':
                idxString = '1,,1,,1,,,,,1,,1,,1,,,,,1,,1,,1,,,,,1,,1,,1';
                break;
            case 'start':
                idxString = '7,,,7,,,7,,,7,,,7,,,7';
                break;
            default:
                break;
        }
        const idxList = idxString.split(',').reverse();
        let length = idxList.length;
        while (length--) {
            const idx = +idxList[length]; // 1, 2, 3, 4, 6, 7, 8, 11, 12, 14, 15
            if (idx) {
                toy.playAudioFile(idx);
            }
            await utils_1.wait(100);
        }
        response.end();
    });
    router.get('/sleep', async (request, response) => {
        toy.sleep();
        response.end();
    });
    router.get('/wake', async (request, response) => {
        toy.wake();
        response.end();
    });
};
const main = async () => {
    const sphero = await scanner_1.findR2D2();
    if (sphero) {
        cmdPlay(sphero);
        apiRun(sphero);
    }
};
main();
