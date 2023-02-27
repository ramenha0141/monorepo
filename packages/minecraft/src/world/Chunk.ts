import Block from './block/Block';

export default class Chunk {
    constructor(
        public readonly x: number,
        public y: number,
        public readonly z: number,

        private blocks: Block[],
    ) {}

    private convertPosToIndex(x: number, y: number, z: number) {
        return (y - this.y) * 256 + x * 16 + z;
    }

    public getBlock(x: number, y: number, z: number) {
        return this.blocks[this.convertPosToIndex(x, y, z)] ?? new Block();
    }

    public setBlock(x: number, y: number, z: number, block: Block) {
        this.blocks[this.convertPosToIndex(x, y, z)] = block;
    }
}
