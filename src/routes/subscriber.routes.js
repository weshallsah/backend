import { Router } from "express";
import { verifyJWT } from "../middlewares/userauth.middlewares.js";
import { subscribe, unsubscribe } from "../controller/subscribe.controller.js";


const router = Router();

router.route("/subscribe").post(
    verifyJWT,
    subscribe,
);

router.route("/unsubscribe").post(
    unsubscribe
)

export default router;