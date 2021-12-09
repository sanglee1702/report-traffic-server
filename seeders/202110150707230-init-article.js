'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Articles', [
      {
        title: 'Lorem Ipsum is simply dummy text',
        code: 'BV01',
        categoryId: 1,
        description: 'Lorem Ipsum is simply dummy text......',
        banner: '',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Lorem Ipsum is simply dummy text',
        code: 'BV02',
        categoryId: 1,
        description: 'Lorem Ipsum is simply dummy text......',
        banner: '',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Lorem Ipsum is simply dummy text',
        code: 'BV03',
        categoryId: 1,
        description: 'Lorem Ipsum is simply dummy text......',
        banner: '',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Lorem Ipsum is simply dummy text',
        code: 'BV04',
        categoryId: 1,
        description: 'Lorem Ipsum is simply dummy text......',
        banner: '',
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Articles', null, {});
  },
};
