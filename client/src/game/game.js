import { config } from "./config.js";

export class PhaserGame extends Phaser.Game {
    constructor(channel) {
        super(config);
        this.channel = channel;
    }
} 