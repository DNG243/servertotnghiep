var express = require("express");
var router = express.Router();
var carddt = require("../controller/carddt");
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
router.get("/cardlist", requireLogin, carddt.listCards);
router.get("/detailcard/:id", requireLogin, carddt.getCardDetail);
router.get("/search", requireLogin, carddt.searchCards);
router.get("/editcard/:id", requireLogin, carddt.getEditCard);
router.post("/updateCard/:id", requireLogin, carddt.updateCard);

module.exports = router;
