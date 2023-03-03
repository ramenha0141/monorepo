import BlockRegistry from './BlockRegistry';
import BlockTexture from './BlockTexture';

export default class Block {
    public static readonly id: string = '';
    public static readonly texture: BlockTexture;

    public getId(): string {
        return (this.constructor as typeof Block).id;
    }

    public getTexture(): BlockTexture {
        return (this.constructor as typeof Block).texture;
    }
}

declare module './BlockRegistry' {
    interface BlockId {
        block: Block;
    }
}

BlockRegistry.register('block');
