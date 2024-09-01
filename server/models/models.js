const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true,  allowNull: false},
  password: { type: DataTypes.STRING, allowNull: false},
  isActivated: { type: DataTypes.STRING, defaultValue: false},
  activationLink: { type: DataTypes.STRING},
  role: { type: DataTypes.STRING, defaultValue: "USER" },
});

const Token = sequelize.define("token", {
  refreshToken: { type: DataTypes.STRING, allowNull: false}
})

const Profile = sequelize.define("profiles", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Home = sequelize.define("homes", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING },
});

const Section = sequelize.define("sections", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true },
  order: { type: DataTypes.INTEGER}
});

const Data = sequelize.define("data", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
});

const Resource = sequelize.define("resources", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true },
  img: { type: DataTypes.STRING, allowNull: false },
  order: { type: DataTypes.INTEGER}
});

const ResourceData = sequelize.define("resource_data", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
});

User.hasOne(Profile, { onDelete: 'CASCADE' });
Profile.belongsTo(User);

User.hasOne(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User);

Section.hasMany(Resource, { onDelete: 'CASCADE' });
Resource.belongsTo(Section, { onDelete: 'CASCADE' });

Section.hasMany(Data, { as: "data", onDelete: 'CASCADE' });
Data.belongsTo(Section);

Resource.hasMany(ResourceData, { as: "data_r", onDelete: 'CASCADE' });
ResourceData.belongsTo(Resource);

Resource.belongsToMany(Data, { through: ResourceData, onDelete: 'CASCADE' });
Data.belongsToMany(Resource, { through: ResourceData, onDelete: 'CASCADE' });

module.exports = {
  User,
  Home,
  Token,
  Profile,
  Section,
  Resource,
  Data,
  ResourceData,
};

