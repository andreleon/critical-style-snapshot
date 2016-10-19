import equalObjects from '../utilities/equalObjects.jsx';

function arrayContainsObject(array, object) {
    return array.reduce(function(arrayContainsBool, currentObject) {
        if (equalObjects(currentObject, object)) arrayContainsBool = true;
        return arrayContainsBool;
    }, false);
};

export default arrayContainsObject;
