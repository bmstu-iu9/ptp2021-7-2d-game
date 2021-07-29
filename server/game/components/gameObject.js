import Matter from "matter-js";

export class GameObject {
    body;
    destroyed = false;

    constructor(scene, id) {
        this.scene = scene;
        this.id = id;
    }

    _addBody(body) {
        this.body = body;
        Matter.Composite.add(this.scene.engine.world, this.body);
    }

    _addBodies(bodies) {
        this.body = Matter.Body.create({
            parts: bodies.map(body => body)
        });
        Matter.Composite.add(this.scene.engine.world, this.body);
    }

    destroy() {
        this.destroyed = true;
        Matter.Composite.remove(this.scene.engine.world, this.body);
    }
}