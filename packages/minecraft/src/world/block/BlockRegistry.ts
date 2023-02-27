export interface BlockIds {}

export default class BlockRegistry {
    static blockIDs: Set<string>;

    static register<T extends keyof BlockIds>(id: T) {
        if (!/^[a-z_]+:[a-z_]+$/.test(id)) throw new Error();

        this.blockIDs.add(id);
    }
}
