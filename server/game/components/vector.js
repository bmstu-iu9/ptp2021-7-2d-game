export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static clone(v) {
        return new Vector(v.x, v.y);
    }

    static sum(u, v) {
        return new Vector(u.x + v.x, u.y + v.y);
    }

    static difference(u, v) {
        return new Vector(v.x - u.x, v.y - u.y);
    }

    static scalarMult(k, v) {
        return new Vector(k * v.x, k * v.y);
    }

    static length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    static distance(u, v) {
        return Vector.length(Vector.difference(u, v));
    }

    static normalize(v) {
        const len = Vector.length(v);
        
        if (len > 0) {
            return new Vector(v.x / len, v.y / len);
        }

        return Vector.clone(v);
    }

    static dot(u, v) {
        return u.x * v.x + u.y * v.y;
    }

    static angle(u, v) {
        return Math.acos(Vector.dot(Vector.normalize(u), Vector.normalize(v)));
    }

    static orientedAngle(u, v) {
        const angle = Vector.angle(u, v);

        if (Vector.epsilonEqual(Vector.normalize(v), Vector.normalize(Vector.rotate(u, angle)), 0.0001)) {
            return angle;
        } else {
            return -angle;
        }
    }

    static rotate(v, angle) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        return new Vector(v.x * cos - v.y * sin, v.x * sin + v.y * cos);
    }

    static min(u, v) {
        return new Vector(Math.min(u.x, v.x), Math.min(u.y, v.y));
    }

    static max(u, v) {
        return new Vector(Math.max(u.x, v.x), Math.max(u.y, v.y));
    }

    static epsilonEqual(u, v, epsilon) {
        return (Math.abs(u.x - v.x) < epsilon) &&
               (Math.abs(u.y - v.y) < epsilon);
    }
}