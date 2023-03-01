import BlockRegistry from './BlockRegistry';
import BlockTexture from './BlockTexture';

export default class Block {
    public static readonly id: string = '';
    public static readonly texture: BlockTexture;

    public getTexture(): BlockTexture {
        return (this.constructor as typeof Block).texture;
    }
}

declare module './BlockRegistry' {
    interface BlockIds {
        block: Block;
    }
}

BlockRegistry.register('block');
