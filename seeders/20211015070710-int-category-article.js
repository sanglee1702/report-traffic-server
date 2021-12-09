'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('ArticleCategories', [
      {
        name: 'Quảng Cáo',
        avatarUrl: '',
        code: 'QC',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ArticleCategories', null, {});
  },
};
