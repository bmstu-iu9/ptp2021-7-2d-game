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
    let firstElementNull = elements.indexOf('elementNull');
    let lastElementElectricity = elements.lastIndexOf('elementElectricity');
    let lastElementFire = elements.lastIndexOf('elementFire');
    let lastElementCold = elements.lastIndexOf('elementCold');
    let lastElementWater = elements.lastIndexOf('elementWater');
    let lastElementDeath = elements.lastIndexOf('elementDeath');
    let lastElementLife = elements.lastIndexOf('elementLife');
    let lastElementGround = elements.lastIndexOf('elementGround');
    let elementToCollapse;
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
                if (lastElementElectricity != -1) {
                    collapseElement(elements, firstElementNull, lastElementIce);
                    firstElementNull = elements.indexOf('elementNull');
                    elementToCollapse = elements.indexOf('elementWater');
                    collapseElement(elements, firstElementNull, elementToCollapse);
                } else if (lastElementDeath != -1) {
                    elements[Math.min(lastElementIce, lastElementDeath)] = 'elementPoison';
                    collapseElement(elements, firstElementNull, Math.max(lastElementIce, lastElementDeath));
                }
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
                if (lastElementElectricity != -1) {
                    collapseElement(elements, firstElementNull, lastElementPoison);
                    firstElementNull = elements.indexOf('elementNull');
                    elementToCollapse = elements.indexOf('elementWater');
                    collapseElement(elements, firstElementNull, elementToCollapse);
                } else if (lastElementFire != -1) {
                    elements[Math.min(lastElementPoison, lastElementFire)] = 'elementVapor';
                    collapseElement(elements, firstElementNull, Math.max(lastElementPoison, lastElementFire));
                } else if (lastElementCold != -1) {
                    elements[Math.min(lastElementPoison, lastElementCold)] = 'elementIce';
                    collapseElement(elements, firstElementNull, Math.max(lastElementPoison, lastElementCold));
                }
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
            if (lastElementGround != -1 & lastElementGround > lastElementWater) {
                collapseElement(elements, firstElementNull, lastElementGround);
            } else if (lastElementWater != -1) {
                collapseElement(elements, firstElementNull, lastElementWater);
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
                if (lastElementElectricity != -1) {
                    collapseElement(elements, firstElementNull, lastElementVapor);
                    firstElementNull = elements.indexOf('elementNull');
                    elementToCollapse = elements.indexOf('elementWater');
                    collapseElement(elements, firstElementNull, elementToCollapse);
                } else if (lastElementDeath != -1) {
                    elements[Math.min(lastElementVapor, lastElementDeath)] = 'elementPoison';
                    collapseElement(elements, firstElementNull, Math.max(lastElementVapor, lastElementDeath));
                }
            } else {
                addElement(firstElementNull, elements, 'elementCold');
            }
        break;
    }
}