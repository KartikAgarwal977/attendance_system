'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StudentData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  StudentData.init({
    Student_enroll: DataTypes.STRING,
    StudentName: DataTypes.STRING,
    attendence: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'StudentData',
  });
  return StudentData;
};