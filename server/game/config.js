import '@geckos.io/phaser-on-nodejs'; 

import 'phaser';
import { makeServerScene } from './serverScene.js';

const FPS = 60;
global.phaserOnNodeFPS = FPS;

export function makeConfig(io, roomID) {
    const ServerScene = makeServerScene(io, roomID); 
    const config = {
        type: Phaser.HEADLESS,
        width: 1920,
        height: 1080,
        banner: false,
        audio: false,
        scene: [ServerScene],
        fps: {
            target: FPS
        },
        physics: {
            default: 'matter',
            matter: {
                gravity: { y: 2 }
            }
        }
    };
    return config;
}