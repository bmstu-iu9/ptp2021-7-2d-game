class ElementPic extends Phaser.GameObjects.Image {
    constructor(scene, x, y, pic, name, width, height) {
        super(scene, x, y, pic);
        this.displayHeight = width;
        this.displayWidth = height;
        this.name = name;
    }
}

export class ElementsInterface extends Phaser.GameObjects.Container {
    constructor(scene, maxElementCount, x, y, width, height, elementPicWidth, elementPicHeight, pxBetweenElements, elementNull, interfaceBackground) {
        super(scene, x, y);

        this.maxElementCount = maxElementCount;
        this.width = width;
        this.height = height;
        this.elementPicWidth = elementPicWidth;
        this.elementPicHeight = elementPicHeight;
        this.pxBetweenElements = pxBetweenElements;

        scene.add.existing(this);

        const backgroundPic = new Phaser.GameObjects.TileSprite(scene, 0, 0, width, height, scene.textures.list[interfaceBackground]);
        backgroundPic.name = 'background';
        this.add(backgroundPic);

        for (var i = 0; i < maxElementCount; i++) {
            const elementPic = new ElementPic(scene,
                -(maxElementCount/2-0.5)*elementPicWidth-Math.floor(maxElementCount/2)*pxBetweenElements+i*(elementPicWidth+pxBetweenElements),
                0, scene.textures.list[elementNull], 'element'+i, elementPicWidth, elementPicHeight);
            this.add(elementPic);
        }

        this.scene.channel.on('changeElements', (elements) => {
            this.changeElements(elements);
        });
    }

    changeElements(elements) {
        for (var i = 0; i < elements.length; i++) {
            this.list[i+1].setTexture(elements[i]);
        }
    }
}