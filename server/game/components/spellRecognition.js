import { Vector } from "./vector.js";

export class Recognizer {
    static requiredPointCount = 20;

    static #inputPointsList;
    static #keyPointsIndices;
    static #finalPointsList;

    static analyze(coords) {
        this.#inputPointsList = [];
        this.#keyPointsIndices = [];
        this.#finalPointsList = [];

        for (const c of coords) { 
            this.#inputPointsList.push(new Vector(c.x, c.y));
        }

        if (this.#inputPointsList.length < 2) {
            return;
        }
        
        this.#findKeyPoints(this.#inputPointsList);

        if (this.#keyPointsIndices.length > this.requiredPointCount) {
            return;
        }

        this.#resampleInput(this.#inputPointsList);

        // get dirs, find matching pattern
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
            const thisPoint = input[i - 1];
            const nextPoint = input[i];

            const distance = Vector.length(Vector.difference(thisPoint, lastKeyPoint));
            if (distance > currTolerance) {
                const angle = Vector.angle(Vector.difference(thisPoint, lastKeyPoint),
                                           Vector.difference(thisPoint, nextPoint));
                if (angle < maxAngle) {
                    this.#keyPointsIndices.push(i - 1);
                    lastKeyPoint = thisPoint;
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

    static #resampleInput(input) {
        let totalLength = 0;
        for (let i = 1; i < input.length; ++i) {
            totalLength += Vector.distance(input[i - 1], input[i]);
        }

        this.#finalPointsList.push(input[0]); // -1 from the remaining required points

        const segmentCount = this.#keyPointsIndices.length - 1;
        let pointsAdded = 0;
        let segmentRemains = 0;

        for (let segment = 0; segment < segmentCount; ++segment) {

            // Distance along the curve 
            let segmentLength = 0;
            for (let index = this.#keyPointsIndices[segment]; index < this.#keyPointsIndices[segment + 1]; ++index) {
                segmentLength += Vector.distance(input[index], input[index + 1]);
            }

            const pointsToAddFloat = (segmentLength / totalLength) * (this.requiredPointCount - 1) + segmentRemains;
            let pointsToAdd = Math.round(pointsToAddFloat);
            segmentRemains = pointsToAddFloat - pointsToAdd;

            if (segment != segmentCount - 1) {
                pointsAdded += pointsToAdd;
            } else {
                pointsToAdd = (this.requiredPointCount - 1) - pointsAdded;
            }

            if (pointsToAdd == 0) {
                continue;
            }

            const interval = segmentLength / pointsToAdd;
            let remains = 0;
            
            let newPointAdded = false;
            let endOfSegment = false;

            let index = this.#keyPointsIndices[segment] + 1;
            let reallyAdded = 0;
            const endIndex = this.#keyPointsIndices[segment + 1];
            
            let prevPoint = input[this.#keyPointsIndices[segment]];
            let thisPoint = new Vector(0, 0);

            // Add points in between key points while retaining curvature
            while (!endOfSegment || newPointAdded) {
                if (!newPointAdded) {
                    if (!endOfSegment) {
                        thisPoint = input[index];
                        if (index == endIndex) {
                            endOfSegment = true;
                        } else {
                            ++index;
                        }
                    }
                } else {
                    newPointAdded = false;
                }

                const dist = Vector.distance(prevPoint, thisPoint);
                const coeff = (interval - remains) / dist;
                if ((remains + dist) >= interval) {
                    const newFinalPoint = Vector.sum(prevPoint, Vector.scalarMult(coeff, Vector.difference(prevPoint, thisPoint)));
                    this.#finalPointsList.push(newFinalPoint);
                    ++reallyAdded;
                    remains = 0;
                    prevPoint = newFinalPoint;
                    newPointAdded = true;
                    continue; /* Point_i -------------------------- newFinalPoint -------------------------- Point_i+1 
                                           interval - prevRemains    (prevPoint)                            (thisPoint) */
                } else {
                    remains += dist;
                }

                prevPoint = thisPoint;
            }

            // Fell short of one point due to rounding error
            if (reallyAdded == pointsToAdd - 1) {
                this.#finalPointsList.push(input[endIndex]);
            }
        }
    }
}