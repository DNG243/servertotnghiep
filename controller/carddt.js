const firebase = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.listCards = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "cards");
  onValue(dbRef, (snapshot) => {
    const cardsObject = snapshot.val();
    // Chuyển đổi đối tượng cards thành mảng
    const cardsArray = Object.keys(cardsObject).map((key) => {
      return cardsObject[key];
    });

    // Sắp xếp mảng cards theo thời gian từ mới nhất
    cardsArray.sort((a, b) => {
      const aDate = new Date(a.time.split(' ')[0].split('/').reverse().join('-') + ' ' + a.time.split(' ')[1]);
      const bDate = new Date(b.time.split(' ')[0].split('/').reverse().join('-') + ' ' + b.time.split(' ')[1]);
      return bDate - aDate;
    });
    // Sử dụng dữ liệu của cards ở đây
    console.log(cardsArray);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("card/cardList", {
      cards: cardsArray.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: Math.ceil(cardsArray.length / limit),
    });
  });
};

exports.getCardDetail = async (req, res, next) => {
  const cardId = req.params.id;
  const cardRef = ref(db, `cards/${cardId}`);
  onValue(cardRef, (snapshot) => {
    const cardDetail = snapshot.val();
    // Sử dụng dữ liệu của card ở đây
    console.log(cardDetail);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("card/cardDetail", { card: cardDetail, cardId: cardId });
  });
};

exports.searchCards = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "cards");
  onValue(dbRef, (snapshot) => {
    const cardsObject = snapshot.val();
    let cardsArray = Object.keys(cardsObject).map((key) => {
      return cardsObject[key];
    });

    const filteredCards = cardsArray.filter(card =>
      (card.username && card.username.includes(searchText)) ||
      (card.cardProvider && card.cardProvider.includes(searchText)) ||
      (card.status && card.status.includes(searchText))
    );

    const totalPages = Math.ceil(filteredCards.length / limit);

    res.render("card/cardList", {
      cards: filteredCards.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: totalPages
    });
  });
};
