import { ElementsInterface } from "./components/elements";

export class InterfaceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'interface', active: true });
    }

    init() {
        this.socket = this.game.socket;  
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

        this.load.json('inputdata', 'public/settings/input.json');
    }

    create() {
        this.elementsInterface = new ElementsInterface(this, 5, 960, 1040, 360, 80, 60, 60, 10, 'elementNull', 'interfaceBackground');

        const data = this.cache.json.get('inputdata');
        this.addKeyboardEvent('elementFire', data['elementFire'], 'down');
        this.addKeyboardEvent('elementWater', data['elementWater'], 'down');
        this.addKeyboardEvent('elementLife', data['elementLife'], 'down');
        this.addKeyboardEvent('elementDeath', data['elementDeath'], 'down');
        this.addKeyboardEvent('elementElectricity', data['elementElectricity'], 'down');
        this.addKeyboardEvent('elementGround', data['elementGround'], 'down');
        this.addKeyboardEvent('elementCold', data['elementCold'], 'down');
        this.addKeyboardEvent('elementNull', data['elementNull'], 'down');
    }

    addKeyboardEvent(name, keyCode, event) {
        const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyCode]);
        key.name = name;
        key.on(event, () => {
            this.socket.emit('addElement', name);
        });
    }
}