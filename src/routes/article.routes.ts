import ArticleControllers from '../controllers/article.controllers';
import express from 'express';

const ArticleRouter = express.Router();

const ARTICLE_PATH = '/articles';

// get list categories
ArticleRouter.get(
  `${ARTICLE_PATH}/categories`,
  ArticleControllers.getArticleCategories,
);
//create category
ArticleRouter.post(
  `${ARTICLE_PATH}/categories`,
  ArticleControllers.createCategory,
);
//update category
ArticleRouter.put(
  `${ARTICLE_PATH}/categories`,
  ArticleControllers.updateCategory,
);
// delete
ArticleRouter.delete(
  `${ARTICLE_PATH}/categories/:categoryId`,
  ArticleControllers.deleteCategoryAsync,
);
// get list
ArticleRouter.get(`${ARTICLE_PATH}`, ArticleControllers.getArticles);
// get list
ArticleRouter.get(`${ARTICLE_PATH}/:articleId`, ArticleControllers.getArticle);
// create
ArticleRouter.post(`${ARTICLE_PATH}`, ArticleControllers.create);
// update
ArticleRouter.put(`${ARTICLE_PATH}`, ArticleControllers.update);
// delete
ArticleRouter.delete(
  `${ARTICLE_PATH}/delete/:id`,
  ArticleControllers.deleteAsync,
);
// add or remove product to wishlist
ArticleRouter.put(
  `${ARTICLE_PATH}/whishlist/:id`,
  ArticleControllers.addOrRemoveArticleToWhishlist,
);

export default ArticleRouter;
