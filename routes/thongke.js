var express = require("express");
var router = express.Router();
var thongke = require("../controller/thongke");
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
router.get("/thongkeall", requireLogin, thongke.listAllData);

module.exports = router;
