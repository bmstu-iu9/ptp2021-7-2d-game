import "phaser";
import { GameScene } from "./gameScene.js";
import { InterfaceScene } from "./interfaceScene.js";

export const config = {
    parent: document.getElementById('game'),
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [GameScene, InterfaceScene]
};