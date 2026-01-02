"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

// IMPORTANT: this file expects that you have a working:
// server/config/database.js -> exports a Sequelize instance (sequelize)
const sequelize = require("../config/database");

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    // Each model file should export a function: (sequelize, DataTypes) => Model
    const modelDef = require(path.join(__dirname, file));
    if (typeof modelDef !== "function") {
      // Defensive: skip files that don't export expected factory
      console.warn(`Skipping model file (not a function): ${file}`);
      return;
    }
    const model = modelDef(sequelize, Sequelize.DataTypes);
    if (!model || !model.name) {
      console.warn(`Model in ${file} did not return a valid model.`);
      return;
    }
    db[model.name] = model;
  });

// Call associate() on each model, if defined
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
