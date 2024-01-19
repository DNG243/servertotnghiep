const firebase = require("firebase/app");
const { getDatabase, ref, get, update } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.listCards = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const dbRef = ref(db, "cards");
  try {
    const snapshot = await get(dbRef);
    const cardsObject = snapshot.val();
    const cardsArray = Object.keys(cardsObject).map((key) => {
      return cardsObject[key];
    });

    cardsArray.sort((a, b) => {
      const aDate = new Date(a.time.split(' ')[0].split('/').reverse().join('-') + ' ' + a.time.split(' ')[1]);
      const bDate = new Date(b.time.split(' ')[0].split('/').reverse().join('-') + ' ' + b.time.split(' ')[1]);
      return bDate - aDate;
    });

    res.render("card/cardList", {
      cards: cardsArray.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: Math.ceil(cardsArray.length / limit),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getCardDetail = async (req, res, next) => {
  const cardId = req.params.id;
  const cardRef = ref(db, `cards/${cardId}`);
  try {
    const snapshot = await get(cardRef);
    const cardDetail = snapshot.val();
    res.render("card/cardDetail", { card: cardDetail, cardId: cardId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.searchCards = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "cards");
  try {
    const snapshot = await get(dbRef);
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
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getEditCard = async (req, res, next) => {
  const cardId = req.params.id;
  const cardRef = ref(db, `cards/${cardId}`);
  let msg=""
  try {
    const snapshot = await get(cardRef);
    const cardDetail = snapshot.val();
    res.render("card/editCard", { message:msg, card: cardDetail, cardId: cardId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateCard = async (req, res, next) => {
  const cardId = req.params.id;
  const { status } = req.body;

  const cardRef = ref(db, `cards/${cardId}`);

  try {
    await update(cardRef, {
      status,
      statusChanged: true
    });

    if (status === 'success') {
      const cardSnapshot = await get(cardRef);
      const card = cardSnapshot.val();
      if (card) {
        const userRef = ref(db, `user/${card.userId}`);
        const userSnapshot = await get(userRef);
        const user = userSnapshot.val();
        if (user) {
          const newWalletValue = user.wallet + parseInt(card.cardValue);
          await update(userRef, { wallet: newWalletValue });
        }
      }
    }

    const snapshot = await get(cardRef);
    const cardDetail = snapshot.val();

    res.render('card/editCard', { message: `Cập nhật thẻ thành công!`, card: cardDetail, cardId: cardId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

