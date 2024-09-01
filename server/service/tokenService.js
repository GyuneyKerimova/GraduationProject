const jwt = require('jsonwebtoken');
const { Token } = require("../models/models");

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: "30m"})
        const refreshToken = jwt.sign(payload, process.env.REFRESH_KEY, {expiresIn: "30d"})
        console.log('Я работаю')
        console.log(accessToken)
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try{
            console.log('Я ТОКЕН')
            console.log(token)
            const userData = jwt.verify(token, process.env.SECRET_KEY)
            return userData
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try{
            const userData = jwt.verify(token, process.env.REFRESH_KEY)
            console.log("Успех токен")
            return userData
        } catch (e) {
            return null
        }
    }

    async saveToken(userId, refreshToken) {
        console.log(userId);
        const tokenData = await Token.findOne({ where: { userId } });
        // console.log(tokenData);
    
        let token;
    
        if (tokenData) {
            await Token.update({ refreshToken }, { where: { userId } });
            token = await Token.findOne({ where: { userId } });
            console.log('Токен');
            console.log(token);
        } else {
            token = await Token.create({ userId, refreshToken });
            console.log('else');
        }
    
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await Token.destroy({ where: { refreshToken } });
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await Token.findOne({ where: { refreshToken } });
        return tokenData;
    }
} 

module.exports = new TokenService()