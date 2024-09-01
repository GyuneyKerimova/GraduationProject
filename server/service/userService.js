const ApiError = require("../error/apiError");
const bcrypt = require("bcrypt");
const { User, Profile } = require("../models/models");
const uuid = require('uuid')
const mailService = require('./mailService')
const tokenService = require("./tokenService");
const UserDto = require('../dtos/userDto')


class UsersService {
  async registration(email, password, role) {
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        throw ApiError.BadRequest("Пользователь с таким email существует");
      }
      const hashPassword = await bcrypt.hash(password, 5);
      const activationLink = uuid.v4()
      const user = await User.create({ email, role, password: hashPassword, activationLink });
      if (role === "USER") {
        const profile = await Profile.create({ userId: user.id });
      }
      
      await mailService.sendActivationMail(email, `${process.env.API_URL}/api/users/activate/${activationLink}`)

      const userDto = new UserDto(user)
      // const tokens = tokenService.generateTokens({...userDto})

      return {
        // ...tokens,
        user: userDto
      }
  }

  async activate(activationLink) {

    console.log(activationLink)

    const user = await User.findOne({ where: { activationLink } })
    console.log(user)
    console.log(activationLink)
    console.log(user.id)

    if(!user) {
      throw ApiError.BadRequest("Неккоректная ссылка активации")
    }

    await User.update({ isActivated: true }, {
      where: { id: user.id },
      returning: true,
    });
    return user
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email }, include: [{ model: Profile, as: "profile" }] });
    console.log('ПРОВЕРКА' + user.role);

    if (!user) {
        throw ApiError.badRequest("Пользователь не найден");
    }

    const comparePassword = bcrypt.compareSync(password, user.password);

    if (!comparePassword) {
        throw ApiError.badRequest("Указан неверный пароль");
    }

    const userDto = new UserDto(user);

    console.log(userDto)


    const tokens = tokenService.generateTokens({ ...userDto });

    console.log(tokens)

    const token = await tokenService.saveToken(userDto.id, tokens.refreshToken);
    
    return {
        ...tokens,
        user: userDto
    };
}

  async logout(refreshToken) {
    console.log(refreshToken)
    const token = await tokenService.removeToken(refreshToken);
    if (!token) {
        console.log("Токен не найден");
    }
    return token;
  }


  async refresh(refreshToken) {
    if (!refreshToken) {
        throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
    }
    const user = await User.findOne({ where: { id: userData.id }, include: [{ model: Profile, as: "profile" }] });
    if (!user) {
        throw ApiError.BadRequest("Пользователь не найден");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
        ...tokens,
        user: userDto
    };
  }

  async getProfile(userId) {
    const user = await User.findOne({ where: { id: userId }, include: [{ model: Profile, as: "profile" }] });

    if (!user) {
        throw ApiError.BadRequest("Пользователь не найден");
    }

    const level = user.profile.level;
    const score = user.profile.score;

    return { level, score };
}

async updateLevel(userId, level) {
  const user = await User.findOne({ where: { id: userId }, include: [{ model: Profile, as: "profile" }] });

  if (!user) {
      throw ApiError.BadRequest("Пользователь не найден");
  }

  await Profile.update({ level }, {
    where: { userId },
    returning: true,
  });
  
  return { level };
}

async updateScore(userId, score) {
  const user = await User.findOne({ where: { id: userId }, include: [{ model: Profile, as: "profile" }] });

  if (!user) {
      throw ApiError.BadRequest("Пользователь не найден");
  }

  await Profile.update({ score }, {
    where: { userId },
    returning: true,
  });
  
  return { score };
}

async getAllUsers() {
  try {
      const users = await User.findAll(); 
      return users;
  } catch (err) {
    throw ApiError.BadRequest('Не удалось получить всех пользователей'); 
  }
}




}

module.exports = new UsersService();
