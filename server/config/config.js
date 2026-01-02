require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "ahamed",
    database: process.env.DB_NAME || "smart_gym_tracker",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "postgres"
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "ahamed",
    database: (process.env.DB_NAME || "smart_gym_tracker") + "_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "postgres"
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
