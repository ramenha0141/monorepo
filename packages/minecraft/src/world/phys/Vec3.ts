export default class Vec3 {
    constructor(public readonly x: number, public readonly y: number, public readonly z: number) {}

    public add(vec3: Vec3): Vec3 {
        return new Vec3(this.x + vec3.x, this.y + vec3.y, this.z + vec3.z);
    }

    public scale(mul: number): Vec3 {
        return new Vec3(this.x * mul, this.y * mul, this.z * mul);
    }

    public equals(vec3: Vec3): boolean {
        return this.x === vec3.x && this.y === vec3.y && this.z === vec3.z;
    }

    public length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
}
