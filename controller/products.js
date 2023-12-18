const firebase = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();
exports.listProducts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  // Lấy dữ liệu từ cơ sở dữ liệu
  const dbRef = ref(db, "products");
  onValue(dbRef, (snapshot) => {
    const productsObject = snapshot.val();
    // Chuyển đổi đối tượng products thành mảng
    const productsArray = Object.keys(productsObject).map((key) => {
      return productsObject[key];
    });
    // Sử dụng dữ liệu của products ở đây
    console.log(productsArray);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("product/productList", {
      products: productsArray.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: Math.ceil(productsArray.length / limit),
    });
  });
};

exports.getProductDetail = async (req, res, next) => {
  const productId = req.params.id;
  const productRef = ref(db, `products/${productId}`);
  onValue(productRef, (snapshot) => {
    const productDetail = snapshot.val();
    // Sử dụng dữ liệu của product ở đây
    console.log(productDetail);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("product/productDetail", {
      product: productDetail,
      productId: productId,
    });
  });
};
exports.searchProducts = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "products");
  onValue(dbRef, (snapshot) => {
    const productsObject = snapshot.val();
    let productsArray = Object.keys(productsObject).map((key) => {
      return productsObject[key];
    });

    const filteredProducts = productsArray.filter(product =>
      (product.productType && product.productType.includes(searchText)||product.brand && product.brand.includes(searchText)||product.name && product.name.includes(searchText))
    );

    const totalPages = Math.ceil(filteredProducts.length / limit);

    res.render("product/productList", {
      products: filteredProducts.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: totalPages
    });
  });
};

