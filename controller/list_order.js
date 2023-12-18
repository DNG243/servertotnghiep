const firebase = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.listOrders = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "list_order");
  onValue(dbRef, (snapshot) => {
    const ordersObject = snapshot.val();
    // Chuyển đổi đối tượng orders thành mảng
    let ordersArray = Object.keys(ordersObject).map((key) => {
      return ordersObject[key];
    });

    // Sử dụng dữ liệu của orders ở đây
    console.log(ordersArray);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("order/orderList", {
      orders: ordersArray.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: Math.ceil(ordersArray.length / limit),
    });
  });
};

exports.getOrderDetail = async (req, res, next) => {
  const orderId = req.params.id;
  const orderRef = ref(db, `list_order/${orderId}`);
  onValue(orderRef, (snapshot) => {
    const orderDetail = snapshot.val();
    // Sử dụng dữ liệu của order ở đây
    console.log(orderDetail);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("order/orderDetail", { order: orderDetail, orderId: orderId });
  });
};
exports.searchOrders = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "list_order");
  onValue(dbRef, (snapshot) => {
    const ordersObject = snapshot.val();
    let ordersArray = Object.keys(ordersObject).map((key) => {
      return ordersObject[key];
    });

    const filteredOrders = ordersArray.filter(order =>
      (order.status && order.status.includes(searchText)) ||
      (order.nameProduct && order.nameProduct.includes(searchText))
    );

    const totalPages = Math.ceil(filteredOrders.length / limit);

    res.render("order/orderList", {
      orders: filteredOrders.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: totalPages
    });
  });
};
