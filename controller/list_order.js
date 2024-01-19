const firebase = require("firebase/app");
const { getDatabase, ref, get, update } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

module.exports = function(io) {
  exports.listOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    const dbRef = ref(db, "list_order");
  
    try {
      const snapshot = await get(dbRef);
      const ordersObject = snapshot.val();
      io.emit('reload', ordersObject);
  
      const ordersArray = await Promise.all(
        Object.keys(ordersObject).map(async (key) => {
          const order = ordersObject[key];
          const userRef = ref(db, `user/${order.idBuyer}`);
          const userSnapshot = await get(userRef);
          const user = userSnapshot.val();
          order.buyerName = user.username;
          return order;
        })
      );
  
      const totalPages = Math.ceil(ordersArray.length / limit);
  
      res.render("order/orderList", {
        orders: ordersArray.slice(skip, skip + limit),
        limit: limit,
        page: page,
        totalPages: totalPages
      }, function(err, html) {
        if (err) {
          return next(err);  // Chuyển lỗi này đến trình xử lý lỗi
        }
        res.send(html);
      });
    } catch (error) {
      console.error(error);
      next(error);
    }

  };
  
  // Các hàm khác của bạn ở đây

  return exports;
}

exports.getEditOrder = async (req, res, next) => {
  const orderId = req.params.id;
  const orderRef = ref(db, `list_order/${orderId}`);
  let msg="";
  try {
    const snapshot = await get(orderRef);
    const orderDetail = snapshot.val();
    // Sử dụng dữ liệu của order ở đây
    console.log(orderDetail);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("order/editOrder", { message:msg, order: orderDetail, orderId: orderId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.postEditOrder = async (req, res, next) => {
  const orderId = req.params.id;
  const status = req.body.status;
  const orderRef = ref(db, `list_order/${orderId}`);
  try {
    await update(orderRef, { status: status });

    const snapshot = await get(orderRef);
    const order = snapshot.val();

    res.render('order/editOrder', { message: `Cập nhật đơn hàng thành công!`, order: order, orderId: orderId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


exports.getOrderDetail = async (req, res, next) => {
  const orderId = req.params.id;
  const orderRef = ref(db, `list_order/${orderId}`);
  try {
    const snapshot = await get(orderRef);
    const orderDetail = snapshot.val();
    // Sử dụng dữ liệu của order ở đây
    console.log(orderDetail);
    // Gửi dữ liệu trở lại cho client qua trang EJS
    res.render("order/orderDetail", { order: orderDetail, orderId: orderId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.searchOrders = async (req, res, next) => {
  const searchText = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  const dbRef = ref(db, "list_order");
  try {
    const snapshot = await get(dbRef);
    const ordersObject = snapshot.val();
    let ordersArray = Object.keys(ordersObject).map((key) => {
      return ordersObject[key];
    });

    const filteredOrders = ordersArray.filter(order =>
      (order.status && order.status.includes(searchText)) ||
      (order.customerName && order.customerName.includes(searchText))
    );

    const totalPages = Math.ceil(filteredOrders.length / limit);

    res.render("order/orderList", {
      orders: filteredOrders.slice(skip, skip + limit),
      limit: limit,
      page: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
