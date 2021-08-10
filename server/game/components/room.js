export class Room {
    size;
    gameStarted = false;

    constructor(id, maxSize, channels) {
        this.id = id;
        this.maxSize = maxSize;
        this.channels = channels;
        this.size = channels.size;
    }

    addChannel(channel) {
        this.channels.set(channel.id, channel);
        this.size++;    
    }

    removeChannel(id) {
        this.channels.delete(id);
        this.size--;
    }
}