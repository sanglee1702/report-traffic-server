'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Products', [
      {
        name: 'Giày Nike Air Jordan 1 Low Black Toe 553558-116',
        code: '1221',
        categoryId: 1,
        cashPrice: 8200000,
        pointsPrice: 500,
        description: 'Lorem Ipsum is simply 1',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
        content: '',
      },
      {
        name: 'Giày Nike Air Jordan 1 Zoom Air Paris Saint-Germain DB3610-105',
        code: '1222',
        categoryId: 1,
        cashPrice: 9900000,
        pointsPrice: 1000,
        description: 'Lorem Ipsum is simply 2',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
        content: '',
      },
      {
        name: "Giày Nike Air Force 1 07 3 'White Black' AO2423-101",
        code: '1222',
        categoryId: 1,
        cashPrice: 4500000,
        pointsPrice: 1000,
        description: 'Lorem Ipsum is simply 2',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
        content: '',
      },
      {
        name: 'Giày Adidas Ultraboost 21 Primeblue',
        code: '1222',
        categoryId: 1,
        cashPrice: 4000000,
        pointsPrice: 1000,
        description: 'Lorem Ipsum is simply 2',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
        content: '',
      },
      {
        name: 'Giày Adidas UltraBoost 20',
        code: '1222',
        categoryId: 1,
        cashPrice: 2000000,
        pointsPrice: 1000,
        description: 'Lorem Ipsum is simply 2',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
      },
      {
        name: 'Adidas Giày Superstar',
        code: '1222',
        categoryId: 1,
        cashPrice: 2300000,
        pointsPrice: 1000,
        description: 'Lorem Ipsum is simply 2',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
        content: '',
      },
      {
        name: 'Giày Thể Thao Unisex Puma X-Ray 2 Square BlkYELLOW',
        code: '1222',
        categoryId: 1,
        cashPrice: 1680000,
        pointsPrice: 1000,
        description: 'Lorem Ipsum is simply 2',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
        content: '',
      },
      {
        name: 'PUMA - Giày sneaker Ralph Sampson Lo Sportstyle',
        code: '1222',
        categoryId: 1,
        cashPrice: 1299000,
        pointsPrice: 1000,
        description: 'Lorem Ipsum is simply 2',
        saleOff: 0,
        size: 'L',
        quantity: 100,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumb: 'files/575739f2-43f8-4dd3-9af3-3cb4661c8fc4.png',
        content: '',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {});
  },
};
