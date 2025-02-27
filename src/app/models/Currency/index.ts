import Sequelize from 'sequelize';
import { Model } from 'sequelize-typescript';

class Currency extends Model {
  id?: number
  sell?: number
  buy?: number
  datetime?: string

  static init (sequelize): any {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        sell: {
          type: Sequelize.DECIMAL(16, 8),
          allowNull: false,
        },
        buy: {
          type: Sequelize.DECIMAL(16, 8),
          allowNull: false,
        },
        datetime: {
          type: Sequelize.DATE,
          allowNull: false
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Currency;
