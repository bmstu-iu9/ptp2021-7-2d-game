import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';

import { Wizard } from './components/wizard.js';
import { arenaData, Arena } from './components/arena.js';
import { changeElements } from './components/elements.js';

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
        this.arenaData = arenaData;
        this.arena = new Arena(this, this.arenaData.server);

        const room = this.io.sockets.adapter.rooms.get(this.roomID); 
        for (const socketID of room) {
            const socket = this.io.sockets.sockets.get(socketID);

            const x = Math.random() * 1200 + 40;
            //const wizard = new Wizard(this, x, 200);

            this.players.set(socket.id, {
                socket,
                elements: ['elementNull', 'elementNull', 'elementNull', 'elementNull', 'elementNull']
                //wizard
            });
        }

        this.events.addListener('clientInitialized', (socket) => {
            socket.emit('createArena', this.arenaData.client);
        });

        this.events.addListener('movement', (socket, movement) => {
            const { left, right, up, down } = movement;
            const speed = 160;
            const jump = 400;
    
            /*const wizard = this.players.get(socket.id).wizard;
            if (left) {
                wizard.setVelocityX(-speed);
            } else if (right) {
                wizard.setVelocityX(speed);
            } else {
                wizard.setVelocityX(0);
            }
    
            if (up) {
                if (wizard.body.touching.down || wizard.body.onFloor()) {
                    wizard.setVelocityY(-jump);
                }
            }*/
        });

        this.events.addListener('playerDisconnected', (socket, reason) => {
            const player = this.players.get(socket.id);
            //player.wizard.destroy();
            this.players.delete(socket.id);
        });

        this.events.addListener('addElement', (socket, element) => {
            const elements = this.players.get(socket.id).elements;
            changeElements(elements, element);
            socket.emit('changeElements', elements);
        });
    }

    update() {
        /*const wizards_data = [];
        this.players.forEach((player) => {
            const { socket, wizard } = player;
            wizards_data.push({ id: socket.id, x: wizard.x, y: wizard.y, velocity: wizard.body.velocity });
        });

        const snapshot = SI.snapshot.create(wizards_data);

        this.io.to(this.roomID).emit('snapshot', snapshot);*/
    }
}
