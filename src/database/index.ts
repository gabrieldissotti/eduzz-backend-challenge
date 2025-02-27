import Sequelize from 'sequelize';
import path from 'path';
import { readdirSync } from 'fs';

import databaseConfig from '../config/database';

const sequelizeModels = [];

readdirSync(path.join(__dirname, '..', 'app/models')).forEach(file => {
  sequelizeModels.push(require(`./../app/models/${file}`).default);
});

class Database {
  public connection: any;

  constructor () {
    this.init();
  }

  init () {
    this.connection = new Sequelize(databaseConfig);

    sequelizeModels
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
