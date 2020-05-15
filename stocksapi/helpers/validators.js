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

module.exports.symbolInvalid = symbolInvalid;
module.exports.dateValid = dateValid;