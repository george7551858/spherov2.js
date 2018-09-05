import { R2D2 } from '../toys/r2d2';
import { wait } from '../utils';
import { findR2D2 } from './lib/scanner';

const url = require('url');

const express = require('express');
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
app.listen(port, () => console.log(`Listening on port ${port}`));


const setLedColor = (toy: R2D2, color: any = {} , position: string = 'all') => {
  toy.wake();
  if (position != 'back') {
    //front LED control
    toy.allLEDsRaw([ 0x00, 0x01, color.r]); //red
    toy.allLEDsRaw([ 0x00, 0x02, color.g]); //green
    toy.allLEDsRaw([ 0x00, 0x04, color.b]); //blue
  }
  if (position != 'front') {
    //back LED control
    toy.setMainLedColor(color.r, color.g, color.b);
  }
};


const g_speed = 255;
let g_offset = 0;



// SORRY FOR THIS CODE, It is my playground for now
const cmdPlay = (toy: R2D2) => {

  let pressTimeout: NodeJS.Timer;
  let heading = 0;
  let currentSpeed = 0;
  let speed = g_speed;
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
        toy.roll(currentSpeed, calibrating ? heading : (heading + g_offset) % 360, []);
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
      await wait(100);
    }
  };

  const handle = async (key: string = '', symbol: any = {}) => {
    cancelPress();
    if (symbol.name === 'up') {
      heading = 0;
      currentSpeed = speed;
      executing = true;
      addTimeout();
    } else if (symbol.name === 'left') {
      heading = 270;
      currentSpeed = speed;
      executing = true;
      addTimeout();
    } else if (symbol.name === 'right') {
      heading = 90;
      currentSpeed = speed;
      executing = true;
      addTimeout();
    } else if (symbol.name === 'down') {
      heading = 180;
      currentSpeed = speed;
      executing = true;
      addTimeout();
    }

    if (key === 'q') {
      speed += 10;
      // console.log('speed', speed);
    } else if (key === 'z') {
      speed -= 10;
      // console.log('speed', speed);
    } else if (key === 'p') {
      process.exit();
    } else if (key === 's') {
      toy.sleep();
    } else if (key === 'a') {
      toy.wake();
    } else if (key === '1') {
      toy.playAudioFile(1);
    } else if (key === '2') {
      toy.playAudioFile(2);
    } else if (key === '3') {
      toy.playAudioFile(3);
    } else if (key === '4') {
      toy.playAudioFile(4);
    } else if (key === '5') {
      toy.playAudioFile(11);
    } else if (key === '6') {
      toy.playAudioFile(12);
    } else if (key === '7') {
      toy.playAudioFile(7);
    } else if (key === '8') {
      toy.playAudioFile(8);
    } else if (key === '9') {
      toy.playAudioFile(14);
    } else if (key === '0') {
      toy.playAudioFile(15);
    } else if (key === 'c') {
      if (calibrating) {
        calibrating = false;
        await toy.setBackLedIntensity(0);
        g_offset = heading;
        heading = 0;
      } else {
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

const apiRun = (toy: R2D2) => {

  router.get('/', async (request, response) => {
    response.json({
      name: R2D2.advertisement.name,
      appVersion: await toy.appVersion(),
      batteryVoltage: await toy.batteryVoltage()
    });
  });

  router.get('/move/:move', async (request, response) => {
    const query = url.parse(request.url, true).query;

    let heading = +query.h || 0;
    let speed = +query.s || 0;

    switch (request.params.move) {
    case 'up':
      heading = 0;
      speed = g_speed;
      break;
    case 'down':
      heading = 180;
      speed = g_speed;
      break;
    case 'left':
      heading = 270;
      speed = g_speed;
      break;
    case 'right':
      heading = 90;
      speed = g_speed;
      break;
    default :
      break;
    }
    console.log(query, request.params, heading, speed);
    toy.wake();
    toy.roll(speed, (heading + g_offset) % 360, []);
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
    case 'reset':
      r = g = b = 'reset';
      break;
    default :
      break;
    }
    console.log(query, request.params, r, g, b);

    let color = { r: r, g: g, b: b};

    if (request.params.color == 'flashing') {
      if ( r==0 && g == 0 && b == 0) {
        color = { r: 0xFF, g: 0, b: 0};
      }
      let counter = Math.floor(+query.second*5) || 10;
      while (counter--) {
        const WAIT_TIME: number = 100;
        setLedColor(toy, color, request.params.position);
        await wait(WAIT_TIME);
        setLedColor(toy, {r:0,g:0,b:0}, request.params.position);
        await wait(WAIT_TIME);
      }
    }
    else {
      setLedColor(toy, color, request.params.position);
    }

    response.end();
  });


  router.get('/play/:idx', async (request, response) => {
    let idx_string = request.params.idx;

    toy.wake();

    switch (idx_string) {
    case 'ok':
      idx_string = '14,,,,,,,14,,,,,,,14,,,,,,,14,,,,,,14,,,,,14,,,,14,,,14,,14,14,14,14,14,14,14,14,14,14';
      break;
    case 'failed':
      idx_string = '1,,1,,1,,,,,1,,1,,1,,,,,1,,1,,1,,,,,1,,1,,1';
      break;
    case 'start':
      idx_string = '7,,,7,,,7,,,7,,,7,,,7';
      break;
    default :
      break;
    }

    let idx_list = idx_string.split(',').reverse();

    let length = idx_list.length;
    while (length--) {
      let idx = +idx_list[length]; // 1, 2, 3, 4, 6, 7, 8, 11, 12, 14, 15
      if (idx) {
        toy.playAudioFile(idx);
      }
      await wait(100);
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
  const sphero = await findR2D2();
  if (sphero) {
    cmdPlay(sphero);
    apiRun(sphero);
  }
};

main();