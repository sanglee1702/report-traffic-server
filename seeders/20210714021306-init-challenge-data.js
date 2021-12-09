'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Challenges', [
      {
        totalDate: 7,
        price: 50000,
        name: '7 ngày - 5km',
        avatarUrl: '',
        totalRun: 5,
        minUserRun: 0,
        isGroupChallenges: false,
        giftReceivingMilestone: '1,3',
        type: 'StepRun',
        objectStatus: 'active',
        submittedBeforeDay: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        totalDate: 14,
        price: 96000,
        name: '14 ngày - 10km',
        avatarUrl: '',
        totalRun: 10,
        minUserRun: 0,
        isGroupChallenges: false,
        type: 'StepRun',
        giftReceivingMilestone: '1,3,5,7',
        submittedBeforeDay: 1,
        objectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Challenges', null, {});
  },
};
