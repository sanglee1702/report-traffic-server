'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // hash password
    const salt = bcrypt.genSaltSync(10);
    const password = await bcrypt.hash('123456', salt);

    return queryInterface.bulkInsert('Accounts', [
      {
        username: 'superadmin',
        token: null,
        password: password,
        hasExpired: true,
        role: 'SuperAdmin',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Accounts', null, {});
  },
};
