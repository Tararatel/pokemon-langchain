import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Pokemon extends Model {
    static associate() {}
  }
  Pokemon.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Pokemon',
    },
  );
  return Pokemon;
};
