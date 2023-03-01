import Vec3 from './Vec3';

class Axis {
    static readonly Negative = new Axis('negative', -1);
    static readonly Positive = new Axis('positive', 1);

    private constructor(
        public readonly name: 'negative' | 'positive',
        public readonly step: number,
    ) {}

    //@ts-expect-error
    public get opposite(): Axis {
        switch (this) {
            case Axis.Negative:
                return Axis.Positive;
            case Axis.Positive:
                return Axis.Negative;
        }
    }
}

export default class Direction {
    static Axis = Axis;

    static readonly North = new Direction('north', new Vec3(0, 0, -1), Axis.Negative);
    static readonly South = new Direction('south', new Vec3(0, 0, 1), Axis.Positive);
    static readonly West = new Direction('west', new Vec3(-1, 0, 0), Axis.Negative);
    static readonly East = new Direction('east', new Vec3(1, 0, 0), Axis.Positive);
    static readonly Down = new Direction('down', new Vec3(0, -1, 0), Axis.Negative);
    static readonly Up = new Direction('up', new Vec3(0, 1, 0), Axis.Positive);

    private constructor(
        public readonly name: 'north' | 'south' | 'west' | 'east' | 'down' | 'up',
        public readonly vec: Vec3,
        public readonly axis: Axis,
    ) {}

    //@ts-expect-error
    public get opposite(): Direction {
        switch (this) {
            case Direction.North:
                return Direction.South;
            case Direction.South:
                return Direction.North;
            case Direction.West:
                return Direction.East;
            case Direction.East:
                return Direction.West;
            case Direction.Down:
                return Direction.Up;
            case Direction.Up:
                return Direction.Down;
        }
    }
}
