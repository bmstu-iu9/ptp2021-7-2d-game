import "phaser";
import { MainScene } from "./gameScene.js";

export const config = {
    parent: document.getElementById('game'),
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [MainScene]
};