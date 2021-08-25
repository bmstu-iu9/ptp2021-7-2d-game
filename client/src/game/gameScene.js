import { Wizard } from './components/wizard';
import { wizardTexturesData } from './components/wizardTexturesData';
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';

const SI = new SnapshotInterpolation(60);

export class GameScene extends Phaser.Scene {
    keys = {
        left: null,
        right: null,
        up: null
    };

    constructor() {
        super({ key: 'game', active: true });
        this.wizards = new Map();
    }

    init() {
        this.channel = this.game.channel;  
    }

    preload() {
        this.load.image('background', 'public/assets/textures/Background.png');
        this.load.image('cloud1', 'public/assets/textures/Cloud1.png');
        this.load.image('cloud2', 'public/assets/textures/Cloud2.png');
        this.load.image('cloud3', 'public/assets/textures/Cloud3.png');
        this.load.image('ground', 'public/assets/textures/Ground.png');

        this.load.spritesheet('wizard', 'public/assets/textures/wizard.png', {
            frameWidth: 32,
            frameHeight: 48
        });

        this.load.image('hp-left-cap', 'public/assets/textures/barHorizontal_green_left.png');
        this.load.image('hp-middle', 'public/assets/textures/barHorizontal_green_mid.png');
        this.load.image('hp-right-cap', 'public/assets/textures/barHorizontal_green_right.png');
    
        this.load.image('mp-left-cap', 'public/assets/textures/barHorizontal_blue_left.png');
        this.load.image('mp-middle', 'public/assets/textures/barHorizontal_blue_mid.png');
        this.load.image('mp-right-cap', 'public/assets/textures/barHorizontal_blue_right.png');

        this.load.image('shadow-left-cap', 'public/assets/textures/barHorizontal_shadow_left.png');
        this.load.image('shadow-middle', 'public/assets/textures/barHorizontal_shadow_mid.png');
        this.load.image('shadow-right-cap', 'public/assets/textures/barHorizontal_shadow_right.png');

        this.load.json('inputdata', 'public/settings/input.json');
    }

    create() {
        this.add.image(960, 540, 'background');
        
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('wizard', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'wizard', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('wizard', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        const data = this.cache.json.get('inputdata');
        this.keys.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[data['left']]);
        this.keys.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[data['right']]);
        this.keys.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[data['jump']]);

        this.channel.on('createArena', (platforms) => {
            for (const name in platforms) {
                const platform = this.add.image(platforms[name].x, platforms[name].y, name);
                platform.displayHeight = platforms[name].height;
                platform.displayWidth = platforms[name].width;
            }
        });

        this.channel.on('snapshot', (snapshot) => {
            SI.snapshot.add(snapshot);
        });

        this.channel.emit('clientInitialized');
    }

    update() {
        const snap = SI.calcInterpolation('x y');
        if (!snap) return;

        const { state } = snap;
        if (!state) return;

        const active = new Set();

        state.forEach((wizardData) => {
            const {id, x, y, velocity} = wizardData;

            active.add(id);
            const exists = this.wizards.has(id);

            if (!exists) {
                const wizard = new Wizard(this, x, y, 100, 100, wizardTexturesData);
                if (id === this.channel.id) {
                    wizard.makeMain();
                }
                this.wizards.set(id, wizard);
            } else {
                const wizard = this.wizards.get(id);
                wizard.setX(x);
                wizard.setY(y);
                
                if (velocity.x < -1) { 
                    wizard.playAnimation('left');
                } else if (velocity.x > 1) {
                    wizard.playAnimation('right');
                } else {
                    wizard.playAnimation('turn');
                }
            } 
        });

        for (const id of this.wizards.keys()) {
            if (!active.has(id)) {
                console.log('DELETE', id);
                const wizard = this.wizards.get(id);
                wizard.destroy();
                this.wizards.delete(id);
            }
        }

        const movement = {
            left: this.keys.left.isDown,
            right: this.keys.right.isDown,
            up: this.keys.up.isDown
        };

        this.channel.emit('movement', movement);
    }
}