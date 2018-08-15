const Koa = require('koa')
const path = require('path')
const ejs = require('ejs')
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const config = require('./config/default.js')
const staticCache  = require('koa-static-cache')
const views = require('koa-views')
const koaBody = require('koa-body');
const compress = require('koa-compress')
const logger = require('koa-logger')
const cors = require('koa-cors')
const router = require('koa-router')
const serve = require('koa-static');
var route = new router();
const app = new Koa()

const sessionMysqlConfig = {
	user:config.database.USER,
	password:config.database.PASSWORD,
	host:config.database.HOST,
	database:config.database.DATABASE
}
// app.use(logger())
// app.use(cors())
// app.use(session({
// 	key:'USER_SID',
// 	store:new MysqlStore(sessionMysqlConfig)
// }))
// app.use(staticCache(path.join(__dirname, './public'),{dynamic: true}, {
//   maxAge: 365 * 24 * 60 * 60
// }))
// app.use(staticCache(path.join(__dirname, './public/avator'),{dynamic: true}, {
//   maxAge: 365 * 24 * 60 * 60
// }))

// app.use(views(path.join(__dirname,'./views'),{
// 	extension: 'ejs'
// }))
// app.use(compress({threshold: 2048}))
// app.use(require('./router/admin.js').routes()).use(route.allowedMethods())
// app.use(require('./router/mobile.js').routes()).use(route.allowedMethods())


// app.use(koaBody({ multipart: true,formidable:{uploadDir: path.join(__dirname,'./public/images')}}));

// app.use(serve(__dirname));

// app.listen(3000)

// console.log('listen in 3000')
var fs = require('fs');
var http = require('http');
var https = require('https');

var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var ca = [ fs.readFileSync('sslcert/intermediate.crt', 'utf8') ];
var credentials = {ca: ca, key: privateKey, cert: certificate};

var routes = require('./router')(app);
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(3000);
httpsServer.listen(4433);
