import express from "express";
import accessTokenValidator from "../../validators/accessTokenValidator";
import accessTokenAuthMiddleware from "../../middlewares/accessTokenAuthMiddleware";

const router = express.Router();

router.use(require("./token"));

router.use(accessTokenValidator);
router.use(accessTokenAuthMiddleware);

router.use(require("./game"));

module.exports = router;
