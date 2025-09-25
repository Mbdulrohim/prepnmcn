const { DataSource } = require("typeorm");
const { User } = require("./src/entities/User");
const { EmailCode } = require("./src/entities/EmailCode");
const { Feedback } = require("./src/entities/Feedback");

module.exports = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [User, EmailCode, Feedback],
});
