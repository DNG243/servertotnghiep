const firebase = require("firebase/app");
const { getDatabase, ref, get, update } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.listUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const dbRef = ref(db, "user");
  try {
    const snapshot = await get(dbRef);
    const usersObject = snapshot.val();
    let usersArray = Object.keys(usersObject).map((key) => {
      return usersObject[key];
    });

    // Filter the usersArray to only include users with user_type: false
    usersArray = usersArray.filter(user => user.user_type === false);

    res.render("user/userList", {
      users: usersArray.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: Math.ceil(usersArray.length / limit),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


exports.getUserDetail = async (req, res, next) => {
  const userId = req.params.id;
  const userRef = ref(db, `user/${userId}`);
  try {
    const snapshot = await get(userRef);
    const userDetail = snapshot.val();
    res.render("user/userDetail", { user: userDetail, userId: userId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const userId = req.params.id;
  const { username, email, phone, address, user_type, lock } = req.body;

  const userRef = ref(db, `user/${userId}`);

  try {
    await update(userRef, {

      lock: lock === 'true' // Chuyển đổi chuỗi thành boolean
    });

    const snapshot = await get(userRef);
    const user = snapshot.val();

    res.render('user/userEdit', { message: `Cập nhật thông tin người dùng thành công!`, user: user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


exports.showEditForm = async (req, res, next) => {
  const userId = req.params.id;
  const userRef = ref(db, `user/${userId}`);
  try {
    const snapshot = await get(userRef);
    const userDetail = snapshot.val();
    res.render("user/userEdit", { user: userDetail, userId: userId, message: null });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const dbRef = ref(db, "user");
  try {
    const snapshot = await get(dbRef);
    const usersObject = snapshot.val();
    const usersArray = Object.keys(usersObject).map((key) => {
      return usersObject[key];
    });

    const filteredUsers = usersArray.filter(
      (user) =>
        (user.username && user.username.includes(searchText)) ||
        (user.email && user.email.includes(searchText))
    );

    const totalPages = Math.ceil(usersArray.length / limit);

    res.render("user/userList", {
      users: filteredUsers,
      limit: limit,
      page: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
