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
    }

    create() {
        this.elementsInterface = new ElementsInterface(this, 5, 960, 1040, 360, 80, 60, 60, 10, 'elementNull', 'interfaceBackground');
        fetch("public/settings/input.json").then(response => { 
            return response.json(); 
        }).then(data => {
            this.elementsInterface.addKeyboardEvent('elementFire', data['elementFire'], 'down');
            this.elementsInterface.addKeyboardEvent('elementWater', data['elementWater'], 'down');
            this.elementsInterface.addKeyboardEvent('elementLife', data['elementLife'], 'down');
            this.elementsInterface.addKeyboardEvent('elementDeath', data['elementDeath'], 'down');
            this.elementsInterface.addKeyboardEvent('elementElectricity', data['elementElectricity'], 'down');
            this.elementsInterface.addKeyboardEvent('elementGround', data['elementGround'], 'down');
            this.elementsInterface.addKeyboardEvent('elementCold', data['elementCold'], 'down');
            this.elementsInterface.addKeyboardEvent('elementNull', data['elementNull'], 'down');
        });
    }
}