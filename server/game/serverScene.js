import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';

import { GameObjectGroup } from './components/gameObjectGroup.js';
import { Wizard } from './components/wizard.js';
import { collisionFilter } from './components/collisions.js';
import { arenaData, Arena } from './components/arena.js';

const SI = new SnapshotInterpolation();

let io, roomID;  
export function makeServerScene(_io, _roomID) {
    io = _io;
    roomID = _roomID;
    return ServerScene;
} 

class ServerScene extends Phaser.Scene {
    constructor() {
        super();
        this.players = new Map();

        this.io = io; 
        this.roomID = roomID;
    }

    create() {
        this.matter.world.setBounds(0, 0, 1920, 1080);

        this.objectGroup = new GameObjectGroup();

        this.arenaData = arenaData;
        this.arena = new Arena(this, this.arenaData.server);

        const room = this.io.sockets.adapter.rooms.get(this.roomID); 
        for (const socketID of room) {
            const socket = this.io.sockets.sockets.get(socketID);

            //const x = Math.random() * 1920 + 40;
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

        this.events.addListener('clientInitialized', (socket) => {
            socket.emit('createArena', this.arenaData.client);
        });

        this.events.addListener('movement', (socket, movement) => {
            const wizard = this.players.get(socket.id).wizard;
            wizard.move(movement);
        });

        this.events.addListener('playerDisconnected', (socket, reason) => {
            const player = this.players.get(socket.id);
            this.objectGroup.remove(player.wizard);
            player.wizard.destroy();
            this.players.delete(socket.id);
        });

        this.events.addListener('addElement', (socket, element) => {
            const wizard = this.players.get(socket.id).wizard;
            wizard.updateElements(element);
            socket.emit('changeElements', wizard.elements);
        });

        const collisionEvent = collisionFilter(this.objectGroup);

        this.matter.world.on('collisionstart', collisionEvent);
        this.matter.world.on('collisionactive', collisionEvent);
    }

    update() {
        const wizardsData = [];
        this.players.forEach((player) => {
            const { socket, wizard } = player;
            wizardsData.push({ id: socket.id, x: wizard.body.position.x, y: wizard.body.position.y, 
                               velocity: wizard.body.velocity });
        });

        const snapshot = SI.snapshot.create(wizardsData);

        this.io.to(this.roomID).emit('snapshot', snapshot); 
    }
}
