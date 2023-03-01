import { ReadonlyArrayMinLength } from 'ts-array-length';
import Direction from '../phys/Direction';

export default class BlockTexture {
    public readonly textures: ReadonlyArrayMinLength<string, 1>;

    constructor(...textures: ReadonlyArrayMinLength<string, 1>) {
        this.textures = textures;
    }

    public get(direction: Direction): string {
        return this.textures[direction.index] ?? this.textures[0];
    }
}
