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
    constructor(io, room, gravity, fps) {
        Matter.Common.setDecomp(decomp);

        this.players = new Map();

        this.io = io; 
        this.room = room;
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

        for (const channel of this.room.channels.values()) {
            const x = 1500;
            const wizard = new Wizard(this, x, 10, 
                                      ['elementNull', 'elementNull', 'elementNull', 'elementNull', 'elementNull'], 
                                      channel.id);
            this.objectGroup.add(wizard);

            this.players.set(channel.id, {
                channel,
                wizard
            });
        }

        this['clientInitialized'] = (channel) => {
            channel.emit('createArena', this.arenaData.client);
        };

        this['movement'] = (channel, movement) => {
            const wizard = this.players.get(channel.id).wizard;
            wizard.move(movement);
        };

        this['playerDisconnected'] = (channel) => {
            const player = this.players.get(channel.id);
            this.objectGroup.remove(player.wizard);
            player.wizard.destroy();
            this.players.delete(channel.id);
        };

        this['addElement'] = (channel, element) => {
            const wizard = this.players.get(channel.id).wizard;
            wizard.updateElements(element);
            channel.emit('changeElements', wizard.elements);
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
            const { channel, wizard } = player;
            wizardsData.push({ id: channel.id, x: wizard.body.position.x, y: wizard.body.position.y, 
                               velocity: wizard.body.velocity });
        });

        const snapshot = SI.snapshot.create(wizardsData);

        this.io.room(this.room.id).emit('snapshot', snapshot); 
    }

    destroy() {
        stopGameLoop();
        Matter.Engine.clear(this.engine);
        for (let object in this.objectGroup) {
            Matter.Events.off(object);
        }
        setTimeout(() => {
        for (let x in this) {
            this[x] = null;
        }}, 100);
    }
}
