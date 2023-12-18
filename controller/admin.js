const firebase = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

const {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} = require("firebase/auth");
firebase.initializeApp(firebaseConfig);

const auth = getAuth();

const db = getDatabase();

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(`Đang đăng nhập với email: ${email}`); // Ghi log
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userRef = ref(db, `user/${userCredential.user.uid}`);
      onValue(userRef, (snapshot) => {
        const userDetail = snapshot.val();
        console.log(userDetail);
        if (userDetail.user_type) {
          console.log(
            `Đăng nhập thành công với ID người dùng: ${userCredential.user.uid}`
          ); // Ghi log
          res.send("Đăng nhập thành công!");
        } else {
          console.log(
            `Đăng nhập thất bại: Người dùng ${userCredential.user.uid} không có quyền đăng nhập`
          ); // Ghi log
          res
            .status(403)
            .send("Chỉ người dùng có user_type: true mới được phép đăng nhập.");
        }
      });
    })
    .catch((error) => {
      console.log(`Đăng nhập thất bại với lỗi: ${error.message}`); // Ghi log
      res.status(400).send(error.message);
    });
};

exports.logout = async (req, res, next) => {
  signOut(auth)
    .then(() => {
      res.send("Đăng xuất thành công!");
    })
    .catch((error) => {
      res.status(400).send(error.message);
    });
};
