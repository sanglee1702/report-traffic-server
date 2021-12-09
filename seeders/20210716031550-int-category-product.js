'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('ProductCategories', [
      {
        name: 'Giày thể thao',
        avatarUrl: '',
        code: 'U0001',
        mainCategoryId: 1,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Áo thun',
        avatarUrl: '',
        code: 'U0002',
        mainCategoryId: 1,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Dụng cụ',
        avatarUrl: '',
        code: 'U0003',
        mainCategoryId: 1,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Điện thoại',
        avatarUrl: '',
        code: 'U0004',
        mainCategoryId: 2,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Máy tính bản',
        avatarUrl: '',
        code: 'U0005',
        mainCategoryId: 2,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ProductCategories', null, {});
  },
};
