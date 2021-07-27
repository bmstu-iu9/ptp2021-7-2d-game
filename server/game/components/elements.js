function shiftArray(from, elements) {
    for (var i = from; i < elements.length-1; i++) {
        elements[i] = elements[i+1];
    }
}

function addElement(firstElementNull, elements, element) {
    if (firstElementNull != -1) {
        elements[firstElementNull] = element;
    } else {
        shiftArray(0, elements);
        elements[elements.length-1] = element;
    }
}

function collapseElement(elements, firstElementNull, firstElement) {
    shiftArray(firstElement, elements);
    if (firstElementNull == -1) {
        elements[elements.length-1] = 'elementNull';
    } else {
        elements[firstElementNull-1] = 'elementNull';
    }
}

// water, fire, life, death, electricity, ground, cold  +
// life + death = nothing                               +
// electricity + ground = nothing                       +
// electricity + water = nothing                        +
// fire + cold = nothing                                +
// fire + water = vapor                                 +
// water + cold = ice                                   +
// water + death = poison                               +
// ice + fire = water                                   +
// life + poison = water                                +
// cold + vapor = water                                 +

export function changeElements(elements, element) {
    const firstElementNull = elements.indexOf('elementNull');
    const lastElementElectricity = elements.lastIndexOf('elementElectricity');
    const lastElementFire = elements.lastIndexOf('elementFire');
    const lastElementCold = elements.lastIndexOf('elementCold');
    const lastElementWater = elements.lastIndexOf('elementWater');
    const lastElementDeath = elements.lastIndexOf('elementDeath');
    const lastElementLife = elements.lastIndexOf('elementLife');
    const lastElementGround = elements.lastIndexOf('elementGround');
    switch(element) {
        case 'elementNull':
        if (firstElementNull == -1) {
                elements[elements.length-1] = 'elementNull';
            } else if (firstElementNull != 0) {
                elements[firstElementNull-1] = 'elementNull';
            }
        break;
        case 'elementFire':
            const lastElementIce = elements.lastIndexOf('elementIce');
            if (lastElementCold != -1) {
                collapseElement(elements, firstElementNull, lastElementCold);
            } else if (lastElementWater != -1 & lastElementWater > lastElementIce) {
                elements[lastElementWater] = 'elementVapor';
            } else if (lastElementIce != -1) {
                elements[lastElementIce] = 'elementWater';
            } else {
                addElement(firstElementNull, elements, 'elementFire');
            }
        break;
        case 'elementWater':
            if (lastElementElectricity != -1) {
                collapseElement(elements, firstElementNull, lastElementElectricity);
            } else if (lastElementFire != -1 & lastElementFire > lastElementDeath) {
                elements[lastElementFire] = 'elementVapor';
            } else if (lastElementCold != -1 & lastElementCold > lastElementDeath) {
                elements[lastElementCold] = 'elementIce';
            } else if (lastElementDeath != -1) {
                elements[lastElementDeath] = 'elementPoison';
            } else {
                addElement(firstElementNull, elements, 'elementWater');
            }
        break;
        case 'elementLife':
            const lastElementPoison = elements.lastIndexOf('elementPoison');
            if (lastElementDeath != -1) {
                collapseElement(elements, firstElementNull, lastElementDeath);
            } else if (lastElementPoison != -1) {
                elements[lastElementPoison] = 'elementWater';
            } else {
                addElement(firstElementNull, elements, 'elementLife');
            }
        break;
        case 'elementDeath':
            if (lastElementLife != -1) {
                collapseElement(elements, firstElementNull, lastElementLife);
            } else if (lastElementWater != -1) {
                elements[lastElementWater] = 'elementPoison';
            } else {
                addElement(firstElementNull, elements, 'elementDeath');
            }
        break;
        case 'elementElectricity':
            let lastElementToCollapse = Math.max(lastElementGround, lastElementWater);
            if (lastElementToCollapse != -1) {
                collapseElement(elements, firstElementNull, lastElementToCollapse);
            } else {
                addElement(firstElementNull, elements, 'elementElectricity');
            }
        break;
        case 'elementGround':
            if (lastElementElectricity != -1) {
                collapseElement(elements, firstElementNull, lastElementElectricity);
            } else {
                addElement(firstElementNull, elements, 'elementGround');
            }
        break;
        case 'elementCold':
            const lastElementVapor = elements.lastIndexOf('elementVapor');
            if (lastElementFire != -1) {
                collapseElement(elements, firstElementNull, lastElementFire);
            } else if (lastElementWater != -1 & lastElementWater > lastElementVapor) {
                elements[lastElementWater] = 'elementIce';
            } else if (lastElementVapor != -1) {
                elements[lastElementVapor] = 'elementWater';
            } else {
                addElement(firstElementNull, elements, 'elementCold');
            }
        break;
    }
}