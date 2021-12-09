import ProductControllers from '../controllers/product.controllers';
import express from 'express';

const ProductRouter = express.Router();

const PRODUCT_PATH = '/products';

// get product main category
ProductRouter.get(
  `${PRODUCT_PATH}/mains`,
  ProductControllers.getAllProductMainCategory,
);
// create product main category
ProductRouter.post(
  `${PRODUCT_PATH}/mains`,
  ProductControllers.createProductMainCategory,
);
// update product main category
ProductRouter.put(
  `${PRODUCT_PATH}/mains`,
  ProductControllers.updateProductMainCategory,
);
// delete product main category
ProductRouter.delete(
  `${PRODUCT_PATH}/mains/:id`,
  ProductControllers.deleteProductMainCategory,
);

// get product category
ProductRouter.get(
  `${PRODUCT_PATH}/categories`,
  ProductControllers.getAllProductCategory,
);

// create product category
ProductRouter.post(
  `${PRODUCT_PATH}/categories`,
  ProductControllers.createProductCategory,
);
// update product category
ProductRouter.put(
  `${PRODUCT_PATH}/categories`,
  ProductControllers.updateProductCategory,
);
// delete product category
ProductRouter.delete(
  `${PRODUCT_PATH}/categories/:id`,
  ProductControllers.deleteProductCategory,
);

// get list products
ProductRouter.get(`${PRODUCT_PATH}`, ProductControllers.getProducts);
// get list products by ids
ProductRouter.get(`${PRODUCT_PATH}/ids`, ProductControllers.getProductsByIds);
// get product details
ProductRouter.get(`${PRODUCT_PATH}/:id`, ProductControllers.getProductDetail);
// get product comments
ProductRouter.get(
  `${PRODUCT_PATH}/comments/:productId`,
  ProductControllers.getProductComments,
);

// create comment
ProductRouter.post(
  `${PRODUCT_PATH}/comments`,
  ProductControllers.createCommentToProduct,
);
// add or remove product to wishlist
ProductRouter.put(
  `${PRODUCT_PATH}/whishlist/:id`,
  ProductControllers.addOrRemoveProductToWhishlist,
);

// create product
ProductRouter.post(`${PRODUCT_PATH}`, ProductControllers.createProduct);
// update product
ProductRouter.put(`${PRODUCT_PATH}`, ProductControllers.updateProduct);

// delete product
ProductRouter.delete(`${PRODUCT_PATH}/:id`, ProductControllers.deleteProduct);

export default ProductRouter;
