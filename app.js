const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const docsRouter = require('./routes/docs')

const ALLOW_ORIGINS = ['http://localhost:3000']

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//post请求的中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const cors = require('cors')
const corsOption = {
  origin: (origin, callback) => {
    callback(undefined, ALLOW_ORIGINS)
  },
  credentials: true
}
app.use(cors(corsOption))

// app.all('*', function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
//   res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
//   res.header('Content-Type', 'application/json;charset=utf-8')
//   next()
// })
//cors跨域设置

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/docs', docsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

// var mysql = require('mysql')
// var connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '12345678',
//   database: 'docs_db'
// })
// connection.connect()

app.listen(8080)
// connection.end()
module.exports = app
