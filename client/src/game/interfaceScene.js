import { ElementsInterface } from "./components/elements";

export class InterfaceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'interface', active: true });
    }

    init() {
        this.channel = this.game.channel;  
    }

    preload() {
        this.load.image('interfaceBackground', 'public/assets/textures/interfaceBackground.png');
        this.load.image('elementFire', 'public/assets/textures/elementFire.png');
        this.load.image('elementWater', 'public/assets/textures/elementWater.png');
        this.load.image('elementLife', 'public/assets/textures/elementLife.png');
        this.load.image('elementDeath', 'public/assets/textures/elementDeath.png');
        this.load.image('elementElectricity', 'public/assets/textures/elementElectricity.png');
        this.load.image('elementGround', 'public/assets/textures/elementGround.png');
        this.load.image('elementCold', 'public/assets/textures/elementCold.png');
        this.load.image('elementNull', 'public/assets/textures/elementNull.png');
        this.load.image('elementIce', 'public/assets/textures/elementIce.png');
        this.load.image('elementVapor', 'public/assets/textures/elementVapor.png');
        this.load.image('elementPoison', 'public/assets/textures/elementPoison.png');

        this.load.image('particle', 'public/assets/textures/particle_red.png');

        this.load.json('inputdata', 'public/settings/input.json');
    }

    create() {
        this.elementsInterface = new ElementsInterface(this, 5, 960, 1040, 360, 80, 60, 60, 10, 'elementNull', 'interfaceBackground');

        /* Particles for drawing

            TODO: make particles more visible
              (perhaps darkening the screen will solve this)

        */

        this.particles = this.add.particles('particle');

        this.emitter = this.particles.createEmitter({
            on: false,
            speed: 100,
            scale: { start: 1, end: 0 },
            quantity: 2,
            blendMode: 'ADD'
        });

        //---------------------------------------------------

        const data = this.cache.json.get('inputdata');
        for (const element in data['elements']) {
            this.addKeyboardEvent(element, data['elements'][element], 'down', 'addElement');
        }
    }

    update() {
        /* Basic drawing control

            TODO: everything else from Issue #9
            
        */

        if (this.input.mousePointer.isDown) {
            this.emitter.start();
            this.emitter.setPosition(this.input.mousePointer.x, this.input.mousePointer.y);
        } else {
            this.emitter.stop();
        }
    }

    addKeyboardEvent(name, keyCode, event, epistle) {
        const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyCode]);
        key.name = name;
        key.on(event, () => {
            this.channel.emit(epistle, name);
        });
    }
}