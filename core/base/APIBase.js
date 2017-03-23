'use strict';
const ControllerBase = require('./ControllerBase');
const Auth = require('./Auth');
class APIBase {
    constructor(router,app) {
        this._router = router;
        this._app = app;
        this._app.use(function*(next){
            this.Auth = Auth;
            yield next;
        });
        this.JWT = Auth.JWT;
    }

    controllerLoader(controller){
        let ctl = new controller(this._app.dbManager)
        if(ctl instanceof ControllerBase){
            return ctl;
        }else{
            console.error(`must be extends ControllerBase`);
        }
    }

    get router() {
        return this._router;
    }
    
    post(base,path,fn,needVerify = true){
        let routerPath = `/${base}/${path}`;
        if(needVerify){
            this._router.post(routerPath,Auth.JWT,fn);
        }else{
            this._router.post(routerPath,fn);
        }
    }

    get(base,path,fn,needVerify = true){
        let routerPath = `/${base}/${path}`;
        if(needVerify){
            this._router.get(routerPath,Auth.JWT,fn);
        }else{
            this._router.get(routerPath,fn);
        }
    }
}

module.exports = APIBase;
