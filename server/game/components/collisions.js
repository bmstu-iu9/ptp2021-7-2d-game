export function collisionFilter(objectGroup) {
    return (event) => {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            const labels = [bodyA.label, bodyB.label];

            if (/Sensor/.test(bodyA.label) || /Sensor/.test(bodyB.label)) {
                const sensorBody = /Sensor/.test(bodyA.label) ? bodyA : bodyB;
                const otherBody = /Sensor/.test(bodyA.label) ? bodyB : bodyA;
                if (otherBody.isSensor) return;

                const wizard = objectGroup.get(sensorBody.parent.id);
                if (wizard) {
                    wizard.onSensorCollide({sensorBody, otherBody, pair});
                }
            }
        });
    }
}