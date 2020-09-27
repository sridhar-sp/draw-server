const loginValidator = function(req,res,next){
    console.log("Login validator")
    next()
}

module.exports = loginValidator;