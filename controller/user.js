const firebase = require("firebase/app");
const { getDatabase, ref, onValue, update, get } = require("firebase/database"); // Thêm 'update'

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.listUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "user");
  onValue(dbRef, (snapshot) => {
    const usersObject = snapshot.val();
    const usersArray = Object.keys(usersObject).map((key) => {
      return usersObject[key];
    });
    console.log(usersArray);
    res.render("user/userList", {
      users: usersArray.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: Math.ceil(usersArray.length / limit),
    });
  });
};

exports.getUserDetail = async (req, res, next) => {
  const userId = req.params.id;
  const userRef = ref(db, `user/${userId}`);
  onValue(userRef, (snapshot) => {
    const userDetail = snapshot.val();
    console.log(userDetail);
    res.render("user/userDetail", { user: userDetail, userId: userId });
  });
};



exports.updateUser = async (req, res, next) => {
  const userId = req.params.id;
  const { username, email, phone, address, user_type } = req.body;

  const userRef = ref(db, `user/${userId}`);

  await update(userRef, {
    username: username,
    email: email,
    phone: phone,
    address: address,
    user_type: user_type
  });

  // Lấy dữ liệu người dùng sau khi cập nhật
  const snapshot = await get(userRef);
  const user = snapshot.val();

  // Chuyển thông báo và dữ liệu người dùng qua res.render()
  res.render('user/userEdit', { message: `Cập nhật thông tin cho người dùng: ${username} có email: ${email} thành công!`, user: user });
};



exports.showEditForm = async (req, res, next) => {
  const userId = req.params.id;
  const userRef = ref(db, `user/${userId}`);
  onValue(userRef, (snapshot) => {
    const userDetail = snapshot.val();
    res.render("user/userEdit", { user: userDetail, userId: userId, message: null }); // Thêm message: null vào đây
  });
};


exports.searchUsers = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const dbRef = ref(db, "user");
  onValue(dbRef, (snapshot) => {
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
  });
};
