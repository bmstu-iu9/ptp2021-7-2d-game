import { Vector } from "./vector.js";

export class Recognizer {
    static #keyPointsIndices;
    static #inputPointsList;

    static analyze(coords) {
        this.#inputPointsList = [];
        this.#keyPointsIndices = [];

        for (const c of coords) { 
            this.#inputPointsList.push(new Vector(c.x, c.y));
        }

        if (this.#inputPointsList.length < 2) {
            return;
        }
        
        this.#findKeyPoints(this.#inputPointsList);

        // resample, get dirs, find matching pattern
    }

    static #findKeyPoints(input) {
        const TOLERANCE = 0.3;
        const inputSize = input.length;
        
        const [min, max] = this.#getBoundaryPoints(input, inputSize);
        const currTolerance = (max.x - min.x + max.y - min.y) / 2 * TOLERANCE;

        this.#keyPointsIndices.push(0);
        let lastKeyPoint = input[0];

        const maxAngle = (2 / 3) * Math.PI;

        for (let i = 2; i < inputSize; ++i) {
            const currPoint = input[i - 1];
            const nextPoint = input[i];

            const distance = Vector.length(Vector.difference(currPoint, lastKeyPoint));
            if (distance > currTolerance) {
                const angle = Vector.angle(Vector.difference(currPoint, lastKeyPoint),
                                           Vector.difference(currPoint, nextPoint));
                if (angle < maxAngle) {
                    this.#keyPointsIndices.push(i - 1);
                    lastKeyPoint = currPoint;
                }
            }
        }

        this.#keyPointsIndices.push(inputSize - 1);
    }  

    static #getBoundaryPoints(points, sz) {
        let min = points[0];
        let max = points[0];
        for (let i = 1; i < sz; ++i) {
            min = Vector.min(min, points[i]);
            max = Vector.max(max, points[i]);
        }
        return [min, max];
    }
}