import '@geckos.io/phaser-on-nodejs'; 

import 'phaser';
import { makeServerScene } from './serverScene.js';

const FPS = 60;
global.phaserOnNodeFPS = FPS;

export function makeConfig(io, roomID) {
  const ServerScene = makeServerScene(io, roomID); 
  const config = {
    type: Phaser.HEADLESS,
    width: 1280,
    height: 720,
    banner: false,
    audio: false,
    scene: [ServerScene],
    fps: {
      target: FPS
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1500 }
      }
    }
  };
  return config;
}