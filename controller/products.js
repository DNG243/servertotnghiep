const firebase = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.listProducts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const dbRef = ref(db, "products");
  try {
    const snapshot = await get(dbRef);
    const productsObject = snapshot.val();
    console.log(productsObject);
    const productsArray = Object.keys(productsObject).map((key) => {
      return productsObject[key];
    });

    res.render("product/productList", {
      products: productsArray.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: Math.ceil(productsArray.length / limit),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getProductDetail = async (req, res, next) => {
  const productId = req.params.id;
  const productRef = ref(db, `products/${productId}`);
  try {
    const snapshot = await get(productRef);
    const productDetail = snapshot.val();
    console.log(productDetail);
    res.render("product/productDetail", {
      product: productDetail,
      productId: productId,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.searchProducts = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "products");
  try {
    const snapshot = await get(dbRef);
    const productsObject = snapshot.val();
    let productsArray = Object.keys(productsObject).map((key) => {
      return productsObject[key];
    });

    const filteredProducts = productsArray.filter(
      (product) =>
        (product.productType && product.productType.includes(searchText)) ||
        (product.brand && product.brand.includes(searchText)) ||
        (product.name && product.name.includes(searchText))
    );

    const totalPages = Math.ceil(filteredProducts.length / limit);

    res.render("product/productList", {
      products: filteredProducts.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
