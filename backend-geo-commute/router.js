const Router = require("koa-router");
const router = new Router();
const controler = require("./controler.js");

router.post("/send", controler.modelData);

module.exports = router;
