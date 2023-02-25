import Vec3 from './Vec3';

export default class AABB {
    public readonly minX: number;
    public readonly minY: number;
    public readonly minZ: number;

    public readonly maxX: number;
    public readonly maxY: number;
    public readonly maxZ: number;

    constructor(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number);
    constructor(min: Vec3, max: Vec3);
    constructor(min: Vec3, size?: number);
    constructor(
        ...args: [number, number, number, number, number, number] | [Vec3, Vec3] | [Vec3, number?]
    ) {
        if (f1(args)) {
            this.minX = Math.min(args[0], args[3]);
            this.minY = Math.min(args[1], args[4]);
            this.minZ = Math.min(args[2], args[5]);

            this.maxX = Math.max(args[0], args[3]);
            this.maxY = Math.max(args[1], args[4]);
            this.maxZ = Math.max(args[2], args[5]);
        } else if (f2(args)) {
            const [min, max] = args;

            this.minX = Math.min(min.x, max.x);
            this.minY = Math.min(min.y, max.y);
            this.minZ = Math.min(min.z, max.z);

            this.maxX = Math.max(min.x, max.x);
            this.maxY = Math.max(min.y, max.y);
            this.maxZ = Math.max(min.z, max.z);
        } else {
            const [min] = args;
            const size = args[1] ?? 1;

            this.minX = min.x;
            this.minY = min.y;
            this.minZ = min.z;

            this.maxX = min.x + size;
            this.maxY = min.y + size;
            this.maxZ = min.z + size;
        }
    }

    public min(): Vec3 {
        return new Vec3(this.minX, this.minY, this.minZ);
    }

    public max(): Vec3 {
        return new Vec3(this.maxX, this.maxY, this.maxZ);
    }
}

function f1(args: unknown[]): args is [number, number, number, number, number, number] {
    return typeof args[0] === 'number';
}

function f2(args: unknown[]): args is [Vec3, Vec3] {
    return args[0] instanceof Vec3 && args[1] instanceof Vec3;
}
