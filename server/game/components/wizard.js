export class Wizard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, '');

      scene.add.existing(this);
      scene.physics.add.existing(this);

      this.body.setSize(32, 48);
      this.setCollideWorldBounds(true);
    }
}