const jwt = require('koa-jwt');
class Auth{
	get JWTSecret() {
        return "ugen-cloud";
    }

    newToken(params) {
        return jwt.sign(params, this.JWTSecret);
    }

    verifyToken(token){
    	try{
    		let obj = jwt.verify(token, this.JWTSecret);
    		return obj;
    	}catch(e){
    		console.log(`token error:${token} ${e.message}`);
    		return false;
    	}
    }

    get JWT() {
        return jwt({
            secret: this.JWTSecret,
            getToken: function() {
                if (this.headers.authorization && this.headers.authorization.split(' ')[0] === 'Bearer') {
                    return this.headers.authorization.split(' ')[1];
                } else if (this.request.query && this.request.query.utoken) {
                    return this.request.query.utoken;
                }else if (this.request.body && this.request.body.utoken) {
                    return this.request.body.utoken;
                }
                return null;
            }
        })
    }
}
module.exports = new Auth();