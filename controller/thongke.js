const firebase = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = require("../model/firebaseConfig");

firebase.initializeApp(firebaseConfig);

const db = getDatabase();

exports.filterData = async (req, res, next) => {
  const db = getDatabase();

  let currentDate = new Date();

  let startDate = req.body["start-date"]
    ? new Date(req.body["start-date"])
    : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  let endDate = req.body["end-date"]
    ? new Date(req.body["end-date"])
    : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  let stats = {
    cards: {},
    list_order: {},
    products: {},
  };

  let totalSales = 0; // Biến để tính tổng tiền bán được

  let cardsPromise = new Promise((resolve, reject) => {
    const cardsRef = ref(db, "cards/");
    onValue(
      cardsRef,
      (snapshot) => {
        const cardsData = snapshot.val();
        for (let key in cardsData) {
          let record = cardsData[key];
          let dateParts = record.time.split(" ")[0].split("/");
          let formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
          let recordDate = new Date(formattedDate);

          if (recordDate >= startDate && recordDate <= endDate) {
            if (!stats.cards[formattedDate]) {
              stats.cards[formattedDate] = {
                success: { count: 0, totalValue: 0 },
                failed: { count: 0 },
              };
            }
            if (record.status === "success") {
              stats.cards[formattedDate].success.count++;
              stats.cards[formattedDate].success.totalValue += parseInt(
                record.cardValue
              );
            } else if (record.status === "failed") {
              stats.cards[formattedDate].failed.count++;
            }
          }
        }

        stats.cards = Object.keys(stats.cards)
          .sort()
          .reduce((obj, key) => {
            obj[key] = stats.cards[key];
            return obj;
          }, {});

        console.log("Cards Statistics:", stats.cards);
        resolve();
      },
      {
        onlyOnce: true,
      }
    );
  });

  let listOrderPromise = new Promise((resolve, reject) => {
    const listOrderRef = ref(db, "list_order/");
    onValue(
      listOrderRef,
      (snapshot) => {
        const listOrderData = snapshot.val();
        for (let key in listOrderData) {
          let record = listOrderData[key];
          let date = record.date.split(" ")[0];
          let recordDate = new Date(date);

          if (recordDate >= startDate && recordDate <= endDate) {
            if (!stats.list_order[date]) {
              stats.list_order[date] = {
                success: { count: 0, totalValue: 0 },
                failed: { count: 0 },
              };
            }
            if (record.status === "Done") {
              stats.list_order[date].success.count++;
              stats.list_order[date].success.totalValue += parseInt(
                record.total
              );

              // Thêm phần thống kê sản phẩm

              for (let product of record.listProduct) {
                // Kiểm tra nếu đơn hàng đã hoàn thành
                if (record.status === "Done") {
                  if (!stats.products[product.idProduct]) {
                    stats.products[product.idProduct] = {
                      name: product.namePr,
                      image: product.imgPr,
                      quantity: 0,
                      totalValue: 0,
                    };
                  }
                  stats.products[product.idProduct].quantity +=
                    product.quantityPr;
                  let sales =
                    stats.products[product.idProduct].quantity * product.price;
                  stats.products[product.idProduct].totalValue = sales;
                }
              }

              // Tính tổng tiền bán được từ tất cả các sản phẩm
            } else if (record.status === "Cancle") {
              stats.list_order[date].failed.count++;
            }
          }
        }
        for (let id in stats.products) {
          totalSales += stats.products[id].totalValue;
        }

        console.log(`Tổng tiền bán được từ tất cả các sản phẩm: ${totalSales}`);
        stats.list_order = Object.keys(stats.list_order)
          .sort()
          .reduce((obj, key) => {
            obj[key] = stats.list_order[key];
            return obj;
          }, {});
        console.log("List Order Statistics:", stats.list_order);
        resolve();
      },
      {
        onlyOnce: true,
      }
    );
  });

  Promise.all([cardsPromise, listOrderPromise]).then(() => {
    stats.totalSales = totalSales; // Thêm tổng tiền bán được vào stats

    console.log("Products Statistics:", stats.products);
    console.log(stats);
    res.render("data/dataList", {
      stats: stats,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  });
};
