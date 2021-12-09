'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('ProductComments', [
      {
        title: 'Ngàn yêu thương',
        comment:
          'Tư vấn nhiệt tình,làm việc chu đáo,nắm bắt tâm lý kh tuyệt vời, giày đẹp, nc duyên dáng luôn🥰,ncl tuyệt vời, đề nghị các tín đồ quan tâm thật sâu sắc tới shop nhé,chuc shop buôn may bán đắt quanh năm ngày tháng lun❤️❤️',
        userId: 1,
        star: 4.6,
        nameUserComment: 'Hải vũ',
        email: 'haivu@gmail.com',
        productId: 1,
        objectStatus: 'active',
        createdAt: new Date('06/01/2021'),
        updatedAt: new Date('06/01/2021'),
      },
      {
        title: 'Chất lượng tuyệt vời',
        comment:
          '1 đôi giày basic không thể thiếu trong tủ giày, tks shop vì trải nghiệm tuyệt vời',
        userId: 1,
        star: 4.2,
        nameUserComment: 'Nhung',
        email: 'thuynhung@gmail.com',
        productId: 1,
        objectStatus: 'active',
        createdAt: new Date('05/23/2021'),
        updatedAt: new Date('05/23/2021'),
      },
      {
        title: 'giày tốt',
        comment: 'giày đẹp chất lượng',
        userId: 1,
        star: 4.2,
        nameUserComment: 'hoang',
        email: 'tanhoang@gmail.com',
        productId: 1,
        objectStatus: 'active',
        createdAt: new Date('05/21/2021'),
        updatedAt: new Date('05/21/2021'),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ProductComments', null, {});
  },
};
