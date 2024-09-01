const ApiError = require("../error/apiError");
const jwt = require("jsonwebtoken");
const userService = require('../service/userService')
const { Home } = require("../models/models");
const { validationResult } = require('express-validator');


class UsersController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
      }
      const { email, password, role, secretKey } = req.body;
      let userData;
  
      if (role === "USER" || (role === "ADMIN" && secretKey == process.env.ADMIN_SECRET_KEY)) {
        userData = await userService.registration(email, password, role);
      } else {
        console.log(role)
        console.log(secretKey)
        return next(ApiError.BadRequest("Неверный секретный ключ"));
      }
  
      // res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      return res.json(userData);
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password, profile } = req.body;
      const userData = await userService.login(email, password)
      console.log(userData)
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink)
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
        const { refreshToken } = req.cookies;
        const userData = await userService.refresh(refreshToken);
        res.cookie('refreshToken', userData.refreshToken, {
          httpOnly: true, 
          maxAge: 30 * 24 * 60 * 60 * 1000, 
        });
        return res.json(userData);
    } catch (e) {
        next(e);
    }
}

async getProfile(req, res, next) {
  try {
      const userId = req.params.id; 
      const profileData = await userService.getProfile(userId);
      return res.json(profileData);
  } catch (e) {
      next(e);
  }
}


async updateLevel(req, res, next) {
  try {
    const { id, level } = req.body;
    const updatedLevel = await userService.updateLevel(id, level);
    return res.json(updatedLevel);
  } catch (e) {
      next(e);
  }
}

async updateScore(req, res, next) {
  try {
    const { id, score } = req.body;
    const updatedScore = await userService.updateScore(id, score);
    return res.json(updatedScore);
  } catch (e) {
      next(e);
  }
}


async getAllUsers(req, res, next) {
  try {
      const users = await userService.getAllUsers();
      return res.json(users);
  } catch (e) {
      next(e);
  }
}

async updateSetting(req, res, next) {
  try {
    const { id, description } = req.body;
    console.log(id, description )
    const updatedData = await Home.update({ description }, {
      where: { id },
      returning: true,
    });

    
    return res.json(updatedData[1][0]);
  } catch (e) {
    next(e);
  }
}



async getSetting(req, res, next) {
  try {
    let setting = await Home.findAll();

    console.log(setting);
    return res.json(setting);
  } catch (e) {
    next(e);
  }
}

}

module.exports = new UsersController();
