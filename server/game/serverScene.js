import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
import Matter from 'matter-js';
import decomp from 'poly-decomp';

import { startGameLoop, stopGameLoop } from './components/gameLoop.js';
import { GameObjectGroup } from './components/gameObjectGroup.js';
import { Wizard } from './components/wizard.js';
import { collisionFilter } from './components/collisions.js';
import { arenaData, makeArena } from './components/arena.js';

const SI = new SnapshotInterpolation();

export class ServerScene {
    constructor(io, roomID, gravity, fps) {
        Matter.Common.setDecomp(decomp);

        this.players = new Map();

        this.io = io; 
        this.roomID = roomID;
        this.gravity = gravity;
        this.fps = fps;

        this.create();
    }

    create() {
        this.engine = Matter.Engine.create();
        this.engine.gravity.x = this.gravity.x;
        this.engine.gravity.y = this.gravity.y;

        this.objectGroup = new GameObjectGroup();

        this.arenaData = arenaData;
        this.arena = makeArena(this, this.arenaData.server, this.objectGroup);

        const room = this.io.sockets.adapter.rooms.get(this.roomID); 
        for (const socketID of room) {
            const socket = this.io.sockets.sockets.get(socketID);

            const x = 1500;
            const wizard = new Wizard(this, x, 10, 
                                      ['elementNull', 'elementNull', 'elementNull', 'elementNull', 'elementNull'], 
                                      socket.id);
            this.objectGroup.add(wizard);

            this.players.set(socket.id, {
                socket,
                wizard
            });
        }

        this['clientInitialized'] = (socket) => {
            socket.emit('createArena', this.arenaData.client);
        };

        this['movement'] = (socket, movement) => {
            const wizard = this.players.get(socket.id).wizard;
            wizard.move(movement);
        };

        this['playerDisconnected'] = (socket, reason) => {
            const player = this.players.get(socket.id);
            this.objectGroup.remove(player.wizard);
            player.wizard.destroy();
            this.players.delete(socket.id);
        };

        this['addElement'] = (socket, element) => {
            const wizard = this.players.get(socket.id).wizard;
            wizard.updateElements(element);
            socket.emit('changeElements', wizard.elements);
        };

        const collisionEvent = collisionFilter(this.objectGroup);

        Matter.Events.on(this.engine, 'collisionStart', collisionEvent);
        Matter.Events.on(this.engine, 'collisionActive', collisionEvent);

        startGameLoop(this.update.bind(this), 1000 / this.fps);
    }

    update(delta) {
        Matter.Engine.update(this.engine, delta);

        const wizardsData = [];
        this.players.forEach((player) => {
            const { socket, wizard } = player;
            wizardsData.push({ id: socket.id, x: wizard.body.position.x, y: wizard.body.position.y, 
                               velocity: wizard.body.velocity });
        });

        const snapshot = SI.snapshot.create(wizardsData);

        this.io.to(this.roomID).emit('snapshot', snapshot); 
    }

    destroy() {
        stopGameLoop();
        Matter.Engine.clear(this.engine);
        setTimeout(() => {
        for (let x in this) {
            this[x] = null;
        }}, 100);
    }
}
