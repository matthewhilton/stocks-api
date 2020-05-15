const jwt = require("jsonwebtoken");
const errorResponse = require("../responses/error.json")

const authorize = (req, res, next) => {
    const authorization = req.headers.authorization
    let token = null;

    if(authorization == undefined){
        res.status(403).json({
            error: true,
            message: errorResponse.noAuthorizationHeader
        })
        return;
    } else if(authorization && authorization.split(" ").length == 2){
        token = authorization.split(" ")[1]

        // Verify this token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

            if(decoded.exp > Date.now()){
                // Expired
                res.status(403).json({
                    error: true,
                    message: errorResponse.expiredJWT
                })
                return;
            } else {
                // All checks passed
                next()
                return;
            }
        } catch(e){
            res.status(403).json({
                error: true,
                message: errorResponse.invalidJWT
            })
            return;
        }
    } else {
        res.status(403).json({
            error: true,
            message: errorResponse.malformedJWT
        })
        return;
    }
}

module.exports = authorize;