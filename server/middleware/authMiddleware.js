const ApiError = require("../error/apiError");
const tokenService = require('./../service/tokenService');


module.exports = function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader){
      console.log(6)
      return next(ApiError.UnauthorizedError())
    }

    const accessToken = authorizationHeader.split(' ')[1]; //[0] - тип токена, [1] - токен
    if (!accessToken) {
      console.log(7)
      return next(ApiError.UnauthorizedError())
    }

    const userData = tokenService.validateAccessToken(accessToken)

    console.log(userData)

    if (!userData) {
      console.log(8)
      return next(ApiError.UnauthorizedError())
    }

    req.user = userData
    next()
  } catch (err) {
    console.log(9)
    return next(ApiError.UnauthorizedError())
  }
};