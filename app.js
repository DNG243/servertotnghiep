var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userRouter = require('./routes/user');
var productRouter = require('./routes/products');
var orderRouter = require('./routes/list_order');
var cardRouter = require('./routes/card');
var thongkeRouter = require('./routes/thongke');
var adminRouter = require('./routes/admin'); // Thay './routes/admin' bằng đường dẫn thực tế đến file router của bạn

var app = express();
var server = require('http').createServer(app); // Tạo máy chủ HTTP
var io = require('socket.io')(server); // Khởi tạo Socket.IO

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter(io)); // Truyền io vào router
app.use('/card', cardRouter);
app.use('/thongke', thongkeRouter);
app.use('/admin', adminRouter); // Sử dụng router cho các route bắt đầu với '/admin'

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(5000); // Sử dụng server.listen thay vì app.listen

module.exports = app; // Xuất app
