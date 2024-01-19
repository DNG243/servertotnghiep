var express = require("express");
var router = express.Router();
var user = require("../controller/user");
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

router.get("/listuser", requireLogin, user.listUsers);
router.get("/userdetail/:id", requireLogin, user.getUserDetail);
router.get("/search", requireLogin, user.searchUsers);
router.get("/edit/:id", requireLogin, user.showEditForm);
router.post("/edit/:id", requireLogin, user.updateUser);

module.exports = router;
