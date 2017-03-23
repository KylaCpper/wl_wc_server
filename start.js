var koa = require('koa');
var router = require('koa-router')();
var path = require('path');
var fs = require('fs');
var app = koa();
var koaBody = require('koa-body')();
var DBManager = require('./core/db/DBManager');
var db = new DBManager("mongodb://127.0.0.1/oserio",{});
app.dbManager = db.loadModel();
app.use(koaBody);

//设置头信息
app.use(function *(next){
    this.set({
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Headers":"X-Requested-With",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, authorization"

    });
    yield next;
});
const Main = require('./app/main');
new Main(router,app);

const PluginLoader = require('./core/base/PluginLoader');
new PluginLoader(app);
//----------------load apps------------
/*var appsPath = path.join(__dirname,"app");
var apps = fs.readdirSync(appsPath);
apps.forEach(function(item){
    var dirPath = appsPath + path.sep + item;
    if(fs.statSync(dirPath).isDirectory()){
       new IOTBase(router,dirPath,db);
    }
});
*/

//错误统一处理

app.use(function *(next) {
  if (this.request.method == 'POST') {
    // => POST body
    this.request.body = JSON.parse(this.request.body);
  }
  yield next;
});




app.use(function *(next){
    try {
        yield* next;
    } catch(e) {
        var status = e.status || 500;
        var message = e.message || '服务器错误';
        this.body = {
            'status': status,
            'message': message
        };
        this.app.emit('error', e, this);
    }
});

app.use(router.routes());

process.on('uncaughtException', function (err) {
    console.log(err);
})
app.listen(3000);
// app.listen(3010);
