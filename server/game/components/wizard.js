import { GameObject } from './gameObject.js';
import { changeElements } from './elements.js';

export class Wizard extends GameObject {
    maxVelocity = {
        x: 6,
        y: 10
    };
    width = 32;
    height = 48;

    sensors;
    mainBody;

    canJump = true;
    jumpCooldownTimer = null;

    isTouching = {
        left: false,
        right: false,
        bottom: false
    };

    constructor(scene, x, y, elements, clientId) {
        super(scene, clientId);
        this.elements = elements;

        const w = 32;
        const h = 48;

        this.mainBody = this.Matter.Bodies.rectangle(0, 0, w * 0.6, h, { 
            density: 0.001,
            friction: 0.1,
            frictionStatic: 0.1,
            frictionAir: 0.02,
            label: `wizardMainBody_${this.id}`,
            chamfer: { radius: 10 } 
        });

        this.sensors = {
            bottom: this.Matter.Bodies.rectangle(0, h * 0.5, w * 0.25, 2, { 
                isSensor: true 
            }),
            left: this.Matter.Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, { 
                isSensor: true 
            }),
            right: this.Matter.Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, { 
                isSensor: true 
            })
        };
        this.#setSensorLabel();

        this._addBodies([this.mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right]);

        this.Matter.Body.setInertia(this.body, Infinity);
        this.Matter.Body.setPosition(this.body, {x, y});

        this.scene.events.on("update", this.update, this);
        this.scene.matter.world.on("beforeupdate", this.#resetTouching, this);
    }

    updateElements(element) {
        changeElements(this.elements, element);
    }

    move(movement) {
        const {left, right, up} = movement;

        const isOnGround = this.isTouching.bottom;
        const isInAir = !isOnGround;

        if (left) {
            if (!(isInAir && this.isTouching.left)) {
                this.Matter.Body.setVelocity(this.body, { x: -5, y: this.body.velocity.y });
            }
        } else if (right) {
            if (!(isInAir && this.isTouching.right)) {
                this.Matter.Body.setVelocity(this.body, { x: 5, y: this.body.velocity.y });
            }
        } else {
            this.Matter.Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
        }

        if (up && this.canJump && isOnGround) {
            this.Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: -this.maxVelocity.y });

            this.canJump = false;
            this.isTouching.bottom = false;
            this.jumpCooldownTimer = this.scene.time.addEvent({
                delay: 250,
                callback: () => (this.canJump = true)
            });
        }
    }

    onSensorCollide({ sensorBody, otherBody, pair }) {
        if (/wizardMainBody/.test(otherBody.label)) {
            return;
        }
        
        const sepPadding = otherBody.isStatic ? 0.1 : 0.2;
        const sep = pair.separation - sepPadding

        if (sensorBody === this.sensors.left) {
            this.isTouching.left = true;
            if (pair.separation > sepPadding) {
                this.#translateBody(sep, 0);
            }
        } else if (sensorBody === this.sensors.right) {
            this.isTouching.right = true;
            if (pair.separation > sepPadding) {
                this.#translateBody(-sep, 0);
            }
        } else if (sensorBody === this.sensors.bottom) {
            this.isTouching.bottom = true;
        }
    }

    update() {
        if (this.destroyed) return;

        const velocity = this.body.velocity;
        if (velocity.x > this.maxVelocity.x) {
            this.Matter.Body.setVelocity(this.body, { x: this.maxVelocity.x, y: this.body.velocity.y });
        } else if (velocity.x < -this.maxVelocity.x) {
            this.Matter.Body.setVelocity(this.body, { x: -this.maxVelocity.x, y: this.body.velocity.y });
        }
    }

    destroy() {
        super.destroy();
        if (this.jumpCooldownTimer) this.jumpCooldownTimer.destroy();
        this.scene.events.off("update", this.update, this);
    }

    #setSensorLabel() {
        this.sensors.bottom.label = `wizardBottomSensor_${this.id}`
        this.sensors.left.label = `wizardLeftSensor_${this.id}`
        this.sensors.right.label = `wizardRightSensor_${this.id}`
    }

    #resetTouching() {
        this.isTouching.left = false;
        this.isTouching.right = false;
        this.isTouching.bottom = false;
    }

    #translateBody(dx, dy) {
        this.Matter.Body.setPosition(this.body, {
            x: this.body.position.x + dx,
            y: this.body.position.y + dy
        });
    }
}