export class StatusBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, percent, textures, fullWidth=50) {
        super(scene, x, y);
        this.fullWidth = fullWidth;

        scene.add.existing(this);

        // Background
        const leftShadowCap = new Phaser.GameObjects.Image(scene, -this.fullWidth/2, 0, 
                                                           textures.leftShadowCap).setOrigin(1, 0.5);
        this.add(leftShadowCap);

        const middleShaddow = new Phaser.GameObjects.Image(scene, leftShadowCap.x, 0, 
                                                           textures.middleShaddow).setOrigin(0, 0.5);
        middleShaddow.displayWidth = this.fullWidth;
        this.add(middleShaddow);

        const rightShaddowCap = new Phaser.GameObjects.Image(scene, middleShaddow.x + middleShaddow.displayWidth, 0, 
                                                             textures.rightShadowCap).setOrigin(0, 0.5);
        this.add(rightShaddowCap);

        // Front
        this.leftCap = new Phaser.GameObjects.Image(scene, -this.fullWidth/2, 0, 
                                                    textures.leftCap).setOrigin(1, 0.5);
        this.add(this.leftCap);

        this.middle = new Phaser.GameObjects.Image(scene, this.leftCap.x, 0, 
                                                   textures.middle).setOrigin(0, 0.5);
        this.add(this.middle);

        this.rightCap = new Phaser.GameObjects.Image(scene, this.middle.x + this.middle.displayWidth, 0,
                                                     textures.rightCap).setOrigin(0, 0.5);
        this.add(this.rightCap);

    
        this.setMeterPercentage(percent);
    }

    setMeterPercentage(percent = 1, duration = 1000) {
        const width = this.fullWidth * percent;

        this.scene.tweens.add({
            targets: this.middle,
            displayWidth: width,
            duration: duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.rightCap.x = this.middle.x + this.middle.displayWidth;

                this.leftCap.visible = this.middle.displayWidth > 0;
                this.middle.visible = this.middle.displayWidth > 0;
                this.rightCap.visible = this.middle.displayWidth > 0;
            }
        });
    }
}