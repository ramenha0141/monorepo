export default class Vec2 {
    constructor(public readonly x: number, public readonly y: number) {}

    public add(vec2: Vec2): Vec2 {
        return new Vec2(this.x + vec2.x, this.y + vec2.y);
    }

    public scale(mul: number): Vec2 {
        return new Vec2(this.x * mul, this.y * mul);
    }

    public equals(vec2: Vec2): boolean {
        return this.x === vec2.x && this.y === vec2.y;
    }

    public length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
}
