import { makeConfig } from "./config.js";

export class MatterGame {
    constructor(io, room) {
        const config = makeConfig(io, room);
        for (const parameter in config) {
            this[parameter] = config[parameter];
        }
        this.io = io;
        this.room = this.room;
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
