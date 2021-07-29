export class GameObjectGroup {
    objects = new Map();

    constructor() {}

    // TODO: add(name, x, y, clientId, options) {}
    add(obj) {
        this.objects.set(obj.body.id, obj);
    }

    // TODO: destroy(id) { this.objects.get(id).destroy(); }
    remove(id) {
        this.objects.delete(id);
    }

    get(id) {
        const object = this.objects.get(id);
        return object;
    }
}

