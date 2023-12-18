var express = require("express");
var router = express.Router();
var list_order = require("../controller/list_order");
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
router.get("/listorder", requireLogin, list_order.listOrders);
router.get("/detailorder/:id", requireLogin, list_order.getOrderDetail);
router.get("/search", requireLogin, list_order.searchOrders);

module.exports = router;
