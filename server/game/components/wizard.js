import Matter from 'matter-js';

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

    constructor(scene, x, y, elements) {
        super(scene);
        this.elements = elements;

        const w = 32;
        const h = 48;

        this.mainBody = Matter.Bodies.rectangle(0, 0, w * 0.6, h, { 
            density: 0.001,
            friction: 0.1,
            frictionStatic: 0.1,
            frictionAir: 0.02,
            label: `wizardMainBody_${this.id}`,
            chamfer: { radius: 10 } 
        });

        this.sensors = {
            bottom: Matter.Bodies.rectangle(0, h * 0.5, w * 0.25, 2, { 
                isSensor: true 
            }),
            left: Matter.Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, { 
                isSensor: true 
            }),
            right: Matter.Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, { 
                isSensor: true 
            })
        };
        this.#setSensorLabel();

        this._addBodies([this.mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right]);
        
        // Disabling collisions between wizards
        this.body.collisionFilter = {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: -1
        }

        Matter.Body.setInertia(this.body, Infinity);
        Matter.Body.setPosition(this.body, {x, y});

        Matter.Events.on(this.scene.engine, 'beforeUpdate', this.#beforeUpdate.bind(this));
    }

    updateElements(element) {
        changeElements(this.elements, element);
    }

    #beforeUpdate() {
        this.update();
        this.#resetTouching();
    }

    move(movement) {
        const {left, right, up} = movement;

        const isOnGround = this.isTouching.bottom;
        const isInAir = !isOnGround;

        if (left) {
            if (!(isInAir && this.isTouching.left)) {
                Matter.Body.setVelocity(this.body, { x: -5, y: this.body.velocity.y });
            }
        } else if (right) {
            if (!(isInAir && this.isTouching.right)) {
                Matter.Body.setVelocity(this.body, { x: 5, y: this.body.velocity.y });
            }
        } else {
            Matter.Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
        }

        if (up && this.canJump && isOnGround) {
            Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: -this.maxVelocity.y });

            this.canJump = false;
            this.isTouching.bottom = false;
            this.jumpCooldownTimer = setTimeout(() => {this.canJump = true}, 150);
        }
    }

    onSensorCollide({ sensorBody, otherBody, pair }) {
        if (/wizardMainBody/.test(otherBody.label)) {
            return;
        }
        
        //const sepPadding = otherBody.isStatic ? 0.1 : 0.2;
        const sepPadding = 1;
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
            Matter.Body.setVelocity(this.body, { x: this.maxVelocity.x, y: this.body.velocity.y });
        } else if (velocity.x < -this.maxVelocity.x) {
            Matter.Body.setVelocity(this.body, { x: -this.maxVelocity.x, y: this.body.velocity.y });
        }
    }

    destroy() {
        super.destroy();
        if (this.jumpCooldownTimer) clearTimeout(this.jumpCooldownTimer);
        Matter.Events.off(this.scene.engine, 'beforeUpdate', this.#beforeUpdate);
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
        Matter.Body.setPosition(this.body, {
            x: this.body.position.x + dx,
            y: this.body.position.y + dy
        });
    }
}