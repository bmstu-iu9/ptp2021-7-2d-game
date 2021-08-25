import { Vector } from "./vector.js"; 

const patternData = [
    {spellId: 0, dirs: "2"},
    {spellId: 1, dirs: "0"},
    {spellId: 2, dirs: "20"},
    {spellId: 3, dirs: "020"},
    {spellId: 4, dirs: "16010"},
    {spellId: 5, dirs: "45670"},
    {spellId: 6, dirs: "43210"},
    {spellId: 7, dirs: "0610"},
    {spellId: 8, dirs: "050"}
];

export class Recognizer {
    static #requiredPointCount = 20;
    static #directionCount = this.#requiredPointCount - 1;
    static #patternCount = patternData.length;
    static #maxTolerance = 2;

    static #dirs = new Array(this.#directionCount).fill(0);
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

        if (this.#keyPointsIndices.length > this.#requiredPointCount) {
            return;
        }

        this.#resampleInput(this.#inputPointsList);
        this.#inputToDirs();

        const index = this.#findMatchingPattern();
        if (index >= 0) {
            return patternData[index].spellId;
        } else {
            return -1;
        }
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

            const pointsToAddFloat = (segmentLength / totalLength) * (this.#requiredPointCount - 1) + segmentRemains;
            let pointsToAdd = Math.round(pointsToAddFloat);
            segmentRemains = pointsToAddFloat - pointsToAdd;

            if (segment != segmentCount - 1) {
                pointsAdded += pointsToAdd;
            } else {
                pointsToAdd = (this.#requiredPointCount - 1) - pointsAdded;
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

    static #inputToDirs() {
        for (let i = 1; i < this.#finalPointsList.length; ++i) {
            const dir = this.#quantizeAngleToDir(this.#angleVectorX(Vector.difference(this.#finalPointsList[i - 1],
                                                                                      this.#finalPointsList[i])));
            this.#dirs[i - 1] = dir;
        }
    }

    static #quantizeAngleToDir(angle) {
        return Math.round(angle / (Math.PI / 4)) % 8;
    }

    static #angleVectorX(v) {
        let angle = Vector.orientedAngle(v, new Vector(1, 0));

        if (angle < 0) {
            angle += 2 * Math.PI;
        }

        return angle;
    }

    static #findMatchingPattern() {
        let index = -1;
        let min = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < this.#patternCount; ++i) {
            let refuse = false;
            let errors = 0;

            let patternIndex = 0;
            let inputIndex = 0;
            const patternSize = patternData[i].dirs.length;

            let currPatternDir = Number(patternData[i].dirs[0]);
            let nextPatternDir = Number(patternData[i].dirs[1]);
            let currInputDir = this.#dirs[0];
            let nextInputDir = this.#dirs[1];

            while (inputIndex < this.#directionCount) {
                const diff = this.#angleDiff(currPatternDir, currInputDir);
                errors += diff;

                if (diff > 1 || errors > this.#maxTolerance) {
                    refuse = true;
                    break;
                }

                if (patternIndex < patternSize - 1 && nextInputDir != currInputDir) {
                    if ((nextPatternDir == nextInputDir || 
                         this.#angleDiff(nextInputDir, currPatternDir) > this.#angleDiff(nextInputDir, nextPatternDir))) {
                        ++patternIndex;
                        currPatternDir = nextPatternDir;
                        nextPatternDir = Number(patternData[i].dirs[patternIndex + 1]);
                    }
                }

                currInputDir = nextInputDir;
                nextInputDir = this.#dirs[inputIndex + 1];
                ++inputIndex;
            }

            if (patternIndex < patternSize - 1 || refuse) {
                continue;
            }

            if (errors < min) {
                min = errors;
                index = i;
            }
        }

        if (min <= this.#maxTolerance) {
            return index;
        } else {
            return -1;
        }
    }

    static #angleDiff(x, y) {
        return (4 - Math.abs(Math.abs(x - y) - 4));
    }
}