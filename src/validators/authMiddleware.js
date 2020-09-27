const authValidator = function (req, res, next) {
    const authorization = req.headers.authorization;
    
    console.log("Auth validator " + authorization)
    

    if (!authorization){
        res.status(401).json({
            "message": "Unauthorised"
        })
        return;
    }

    next()
}

module.exports = authValidator;