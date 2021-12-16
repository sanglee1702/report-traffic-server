"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Categories", [
      {
        name: "Truy cập",
        code: "truycap",
        level: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Doanh thu",
        code: "doanhthu",
        level: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Marketing",
        code: "marketing",
        level: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Facebook",
        code: "facebook",
        level: 2,
        parentId: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Google",
        code: "google",
        level: 2,
        parentId: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Zalo",
        code: "zalo",
        level: 2,
        parentId: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Lượt xem",
        code: "luotxem",
        level: 3,
        parentId: 4,
        groupId: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Số lượt xem trung bình",
        code: "soluotxemtrungbinh",
        level: 3,
        parentId: 4,
        groupId: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Thời gian xem trung bình",
        code: "thoigianxemtrungbinh",
        level: 3,
        parentId: 4,
        groupId: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Tỉ lệ thoát trang",
        code: "tilethoattrang",
        level: 3,
        parentId: 4,
        groupId: 1,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Lượt truy cập",
        code: "luottruycap",
        level: 3,
        parentId: 4,
        groupId: 2,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Số khách truy cập mới",
        code: "sokhachtruycapmoi",
        level: 3,
        parentId: 4,
        groupId: 2,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Số khách truy cập hiện tại",
        code: "sokhachtruycaphientai",
        level: 3,
        parentId: 4,
        groupId: 2,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Người theo dõi mới",
        code: "nguoitheodoimoi",
        level: 3,
        parentId: 4,
        groupId: 2,
        objectStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Categories", null, {});
  },
};
