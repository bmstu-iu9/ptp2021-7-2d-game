import { StatusBar } from "./statusBar";

export class Wizard {
    fullHp = 100;
    fullMp = 100;

    constructor(scene, x, y, hp, mp, texturesData) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.mp = mp;

        const wizardHeight = texturesData.wizard.sizes.height;
        const hpBarHeight = texturesData.hpBar.sizes.height;
        const hpBarWidth = texturesData.hpBar.sizes.width;
        const mpBarWidth = texturesData.hpBar.sizes.width;

        this.wizardSprite = new Phaser.GameObjects.Sprite(scene, x, y, texturesData.wizard.texture);
        scene.add.existing(this.wizardSprite);

        this.hpBarDeltaY = -(3/4)*wizardHeight;
        this.mpBarDeltaY = this.hpBarDeltaY + hpBarHeight;

        this.hpBar = new StatusBar(scene, x, y + this.hpBarDeltaY, hp/this.fullHp, texturesData.hpBar.textures, hpBarWidth);
        this.mpBar = new StatusBar(scene, x, y + this.mpBarDeltaY, mp/this.fullMp, texturesData.mpBar.textures, mpBarWidth);
    }

    setX(x) {
        this.wizardSprite.setX(x);
        this.hpBar.setX(x);
        this.mpBar.setX(x);
    }

    setY(y) {
        this.wizardSprite.setY(y);
        this.hpBar.setY(y + this.hpBarDeltaY);
        this.mpBar.setY(y + this.mpBarDeltaY);
    }
    
    playAnimation(anim) {
        this.wizardSprite.anims.play(anim, 'true');
    }

    makeMain() {
        this.wizardSprite.depth = 1;
        this.hpBar.depth = 1;
        this.mpBar.depth = 1;
    }

    changeHp(delta) {
        this.hp += delta;
        if (this.hp > 0) {
            this.hpBar.setMeterPercentage(this.hp/this.fullHp);
        } else {
            this.hpBar.setMeterPercentage(0);
        }
    }

    changeMp(delta) {
        this.mp += delta;
        if (this.mp > 0) {
            this.mpBar.setMeterPercentage(this.mp/this.fullMp);
        } else {
            this.hpBar.setMeterPercentage(0);
        }
    }
}
