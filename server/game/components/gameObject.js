export class GameObject {
    Matter = Phaser.Physics.Matter.Matter; 

    body;
    destroyed = false;

    constructor(scene, id) {
        this.scene = scene;
        this.id = id;
    }

    _addBody(body) {
        this.body = body;
        this.scene.matter.world.add(this.body);
    }

    _addBodies(bodies) {
        this.body = this.Matter.Body.create({
            parts: bodies.map(body => body)
        });
        this.scene.matter.world.add(this.body);
    }

    destroy() {
        this.destroyed = true;
        this.scene.matter.world.remove(this.body);
    }
}