import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';

const SI = new SnapshotInterpolation(60);

export class MainScene extends Phaser.Scene {
    cursors;

    constructor() {
        super({ key: 'game', active: true });
        this.wizards = new Map();
    }

    init() {
        this.socket = this.game.socket;  
    }

    preload() {
      this.load.image('background', 'public/assets/textures/Background.png');
      this.load.image('cloud1', 'public/assets/textures/Cloud1.png');
      this.load.image('cloud2', 'public/assets/textures/Cloud2.png');
      this.load.image('cloud3', 'public/assets/textures/Cloud3.png');
      this.load.image('mountain', 'public/assets/textures/Mountain.png');
      this.load.spritesheet('wizard', 'public/assets/textures/wizard.png', {
          frameWidth: 32,
          frameHeight: 48
      });
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

      this.cursors = this.input.keyboard.createCursorKeys();

      this.socket.on('createArena', (platforms) => {
        for (const name in platforms) {
          const platform = this.add.image(platforms[name].x, platforms[name].y, name);
          platform.displayHeight = platforms[name].height;
          platform.displayWidth = platforms[name].width;
        }
      });

      this.socket.on('snapshot', (snapshot) => {
        SI.snapshot.add(snapshot);
      });

      this.socket.emit('clientInitialized');
    }

    update() {
      const snap = SI.calcInterpolation('x y');
      if (!snap) return;

      const { state } = snap;
      if (!state) return;

      const active = new Set();

      /*state.forEach((wizard_data) => {
        const {id, x, y, velocity} = wizard_data;

        active.add(id);
        const exists = this.wizards.has(id);

        if (!exists) {
          const wizard = this.add.sprite(x, y, 'wizard');
          this.wizards.set(id, wizard);
        } else {
          const wizard = this.wizards.get(id);
          wizard.setX(x);
          wizard.setY(y);
          
          if (velocity.x < 0) { 
            wizard.anims.play('left', true);
          } else if (velocity.x > 0) {
            wizard.anims.play('right', true);
          } else {
            wizard.anims.play('turn');
          }
        } 
      });*/

      /*for (const id of this.wizards.keys()) {
        if (!active.has(id)) {
          console.log('DELETE', id);
          const wizard = this.wizards.get(id);
          wizard.destroy();
          this.wizards.delete(id);
        }
      }*/

      const movement = {
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown,
        up: this.cursors.up.isDown,
        down: this.cursors.down.isDown
      };

      this.socket.emit('movement', movement);
    }
}