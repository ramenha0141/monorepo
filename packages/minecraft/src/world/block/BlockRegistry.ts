export interface BlockId {}

export default class BlockRegistry {
    static blockIds: (keyof BlockId)[];

    static register<T extends keyof BlockId>(id: T) {
        if (!/^[a-z_]+:[a-z_]+$/.test(id)) throw new Error();

        if (this.blockIds.includes(id)) throw new Error();

        this.blockIds.push(id);
    }

    static get<T extends keyof BlockId>(index: number): keyof BlockId | null;
    static get<T extends keyof BlockId>(id: T): number | null;
    static get<T extends keyof BlockId>(indexOrId: number | T) {
        if (typeof indexOrId === 'number') {
            return this.blockIds[indexOrId] ?? null;
        } else {
            const index = this.blockIds.indexOf(indexOrId);
            return index !== -1 ? index : null;
        }
    }
}
