const ApiError = require("../error/apiError");
const tokenService = require('./../service/tokenService');

module.exports = function(role) {
    return function (req, res, next) {
      try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader){
          console.log(1)
          return next(ApiError.UnauthorizedError())
        }
    
        const accessToken = authorizationHeader.split(' ')[1]; //[0] - тип токена, [1] - токен
        if (!accessToken) {
          console.log(2)
          return next(ApiError.UnauthorizedError())
        }

        console.log(accessToken)
    
        const userData = tokenService.validateAccessToken(accessToken)
    
    
        if (!userData) {
          console.log(3)
          return next(ApiError.UnauthorizedError())
        }
        
        if (userData.role != role){
          console.log(4)
          return next(ApiError.Forbidden())
        }
        req.user = userData
        next()
      } catch (err) {
        console.log(5)
        return next(ApiError.UnauthorizedError())
      }
    };
}
