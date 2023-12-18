const firebase = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.listAllData = async (req, res, next) => {
  // Tham chiếu đến bảng 'user'
  const userRef = ref(db, "user");
  onValue(userRef, (snapshot) => {
    const userObject = snapshot.val();
    // Chuyển đổi đối tượng data thành mảng
    const userArray = Object.keys(userObject).map((key) => {
      return userObject[key];
    });
    // Tính tổng số người dùng đã tạo tài khoản
    const totalUsers = userArray.length;
    console.log(`Tổng số người dùng đã tạo tài khoản: ${totalUsers}`);

    // Tham chiếu đến bảng 'products'
    const productRef = ref(db, "products");
    onValue(productRef, (snapshot) => {
      const productObject = snapshot.val();
      // Chuyển đổi đối tượng data thành mảng
      const productArray = Object.keys(productObject).map((key) => {
        return productObject[key];
      });
      // Tính tổng số sản phẩm đã được rao bán và đã được bán
      let totalProductsForSale = 0;
      let totalProductsSold = 0;
      productArray.forEach((product) => {
        totalProductsForSale += product.quantity;
        totalProductsSold += product.sold;
      });
      console.log(`Tổng số sản phẩm đã được rao bán: ${totalProductsForSale}`);
      console.log(`Tổng số sản phẩm đã được bán: ${totalProductsSold}`);

      // Tham chiếu đến bảng 'list_order'
      const orderRef = ref(db, "list_order");
      onValue(orderRef, (snapshot) => {
        const orderObject = snapshot.val();
        // Chuyển đổi đối tượng data thành mảng
        const orderArray = Object.keys(orderObject).map((key) => {
          return orderObject[key];
        });

        // Tạo đối tượng để theo dõi số lượng đơn hàng theo tháng và năm
        let orderStats = {};

        orderArray.forEach((order) => {
          // Lấy năm, tháng, ngày và giờ từ ngày đặt hàng
          let dateTimeParts = order.date.split(" ");
          let dateParts = dateTimeParts[0].split("/");
          let time = dateTimeParts[1];
          let day = dateParts[2];
          let month = dateParts[1];
          let year = dateParts[0];
        
          // Khởi tạo năm nếu chưa có
          if (!orderStats[year]) {
            orderStats[year] = {};
          }
        
          // Khởi tạo tháng nếu chưa có
          if (!orderStats[year][month]) {
            orderStats[year][month] = {
              totalOrders: 0,
              successfulOrders: 0,
              waitingOrders: 0,
              totalAmount: 0,
            };
          }
        
          // Tăng số lượng đơn hàng
          orderStats[year][month].totalOrders++;
        
          // Kiểm tra trạng thái đơn hàng
          if (order.status === "done" && order.paid) {
            orderStats[year][month].successfulOrders++;
            // Tính tổng số tiền cho các đơn hàng đã thanh toán thành công
            orderStats[year][month].totalAmount += order.total;
          } else if (order.status === "waiting") {
            orderStats[year][month].waitingOrders++;
          }
        });
        

        console.log(orderStats); // In ra thống kê đơn hàng theo tháng và năm

        // Tham chiếu đến bảng 'cards'
        const cardsRef = ref(db, "cards");
        onValue(cardsRef, (snapshot) => {
          const cardsObject = snapshot.val();
          // Chuyển đổi đối tượng data thành mảng
          const cardsArray = Object.keys(cardsObject).map((key) => {
            return cardsObject[key];
          });
          // Tính tổng số thẻ
          const totalCards = cardsArray.length;
          console.log(`Tổng số thẻ: ${totalCards}`);

          // Tạo đối tượng để theo dõi số lượng thẻ theo tháng và năm
          let cardStats = {};

          cardsArray.forEach((card) => {
            // Lấy năm và tháng từ thời gian nạp thẻ
            let dateParts = card.time.split("/");
            let timeParts = dateParts[2].split(" ");
            let year = timeParts[0];
            let month = dateParts[1];
            let day = dateParts[0];

            let date = new Date(year, month - 1, day);
            year = date.getFullYear();
            month = date.getMonth() + 1; // getMonth() trả về từ 0 (tháng 1) đến 11 (tháng 12)

            // Khởi tạo năm nếu chưa có
            if (!cardStats[year]) {
              cardStats[year] = {};
            }

            // Khởi tạo tháng nếu chưa có
            if (!cardStats[year][month]) {
              cardStats[year][month] = {
                totalCards: 0,
                successfulCards: 0,
                failedCards: 0,
                totalAmount: 0,
              };
            }

            // Tăng số lượng thẻ
            cardStats[year][month].totalCards++;

            // Kiểm tra trạng thái thẻ
            if (card.status === "success") {
              cardStats[year][month].successfulCards++;
              // Tính tổng số tiền cho các thẻ đã nạp thành công
              cardStats[year][month].totalAmount += parseInt(card.cardValue);
            } else if (card.status === "failed") {
              cardStats[year][month].failedCards++;
            }
          });

          console.log(cardStats); // In ra thống kê thẻ theo tháng và năm

          // Lấy năm và tháng hiện tại
          let currentDate = new Date();
          let currentYear = currentDate.getFullYear();
          let currentMonth = currentDate.getMonth() + 1; // getMonth() trả về từ 0 (tháng 1) đến 11 (tháng 12)
          // Gửi dữ liệu trở lại cho client qua trang EJS
          res.render("data/dataList", {
            userData: userArray,
            productData: productArray,
            orderData: orderArray,
            totalUsers: totalUsers,
            totalProductsForSale: totalProductsForSale,
            totalProductsSold: totalProductsSold,
            orderStats: orderStats,
            cardsData: cardsArray,
            totalCards: totalCards,
            cardStats: cardStats,
            currentYear: currentYear,
            currentMonth: currentMonth,
          });
        });
      });
    });
  });
};
