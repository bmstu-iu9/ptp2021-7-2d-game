import { config } from "./config.js";

export class PhaserGame extends Phaser.Game {
    constructor(socket) {
        super(config);
        this.socket = socket;
    }
} 