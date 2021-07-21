import { makeConfig } from "./config.js";

export class PhaserGame extends Phaser.Game {
  constructor(io, roomID) {
    const config = makeConfig(io, roomID);
    super(config); 
    this.io = io;
    this.roomID = roomID;
  }
}
