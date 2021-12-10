import express from "express";
import CategoryControllers from "../controllers/category.controller";

const CategoryRouter = express.Router();

const CATEGORY_PATH = "/category";

// login
CategoryRouter.post(`${CATEGORY_PATH}/create`, CategoryControllers.create);
CategoryRouter.put(`${CATEGORY_PATH}/update`, CategoryControllers.update);
CategoryRouter.get(`${CATEGORY_PATH}/admin/users`, CategoryControllers.getList);
// delete product category
CategoryRouter.delete(
  `${CATEGORY_PATH}/delete/:id`,
  CategoryControllers.deleteAsync
);

export default CategoryRouter;
