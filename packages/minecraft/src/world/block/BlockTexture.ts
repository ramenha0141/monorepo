import Direction from '../phys/Direction';

export default class BlockTexture {
    public readonly textures: string[];

    constructor(...textures: string[]) {
        if (!textures.length) throw new Error();

        this.textures = textures;
    }

    public get(direction: Direction): string {
        return this.textures[direction.index] ?? this.textures[0];
    }
}
