function symbolInvalid(symbol){
    return(symbol == undefined || symbol.length > 5 || symbol.length < 1 || symbol !== symbol.toUpperCase())
}

function dateValid(date){
    if(date == undefined){
        // Date is undefined - definitely not valid
        return false;
    } else {
        try {
            Date.parse(date)
            // Date parsed ok, return true (valid)
            return true;
        } catch(e) {
            // Error, return false (not valid)
            return false;
        }
    }
}

/**
 * Determines if an array only has the values allowedValue.
 * @param array Array of values to check
 * @param allowedValue values allowed to be in array
 */
function onlyHas(array, allowedValues){
    for(i = 0; i < array.length; i++){
        if(!allowedValues.includes(array[i])){
            return false;
        }
    }

    return true;
}

module.exports.symbolInvalid = symbolInvalid;
module.exports.dateValid = dateValid;
module.exports.onlyHas = onlyHas;