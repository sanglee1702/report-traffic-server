'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('ProductMainCategories', [
      {
        name: 'Thể thao',
        avatarUrl: '',
        code: '0001',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Thiết bị điện tử',
        avatarUrl: '',
        code: '0002',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ProductMainCategories', null, {});
  },
};
