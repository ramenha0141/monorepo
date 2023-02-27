import BlockRegistry from './BlockRegistry';

export default class Block {
    public static readonly id: string = '';
}

declare module './BlockRegistry' {
    interface BlockIds {
        block: Block;
    }
}

BlockRegistry.register('block');
