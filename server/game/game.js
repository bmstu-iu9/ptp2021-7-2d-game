import { makeConfig } from "./config.js";

export class MatterGame {
    constructor(io, roomID) {
        const config = makeConfig(io, roomID);
        for (const parameter in config) {
            this[parameter] = config[parameter];
        }
        this.io = io;
        this.roomID = roomID;
    }

    destroy() {
        for (const scene in this.scenes) {
            this.scenes[scene].destroy();
        }
        for (let x in this) {
            this[x] = null;
        }
    }
}
