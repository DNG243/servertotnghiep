var express = require("express");
var router = express.Router();
var product = require("../controller/products");
const { getAuth } = require("firebase/auth");
const auth = getAuth();

// Middleware yêu cầu đăng nhập
function requireLogin(req, res, next) {
  if (!auth.currentUser) {
    res.redirect("/");
  } else {
    next();
  }
}
router.get("/listproduct", requireLogin, product.listProducts);

router.get("/detailpro/:id", requireLogin, product.getProductDetail);

router.get("/search", requireLogin, product.searchProducts);

module.exports = router;
