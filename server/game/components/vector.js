export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static clone(v) {
        return new Vector(v.x, v.y);
    }

    static difference(u, v) {
        return new Vector(v.x - u.x, v.y - u.y);
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
}