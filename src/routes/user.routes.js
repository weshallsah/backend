import { Router } from "express";
import { Loginuser, registerUser, refreshAccessToken } from "../controller/user.controller.js";
import { upload } from "../middlewares/multter.middlewares.js"
import { verifyJWT } from "../middlewares/userauth.middlewares.js";
import { loggoutUser } from "../controller/user.controller.js";

const router = Router();


router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverimage", maxCount: 1 }
    ]),
    registerUser
);
router.route("/login").post(
    upload.fields([]),
    Loginuser
);

router.route("/logout").post(
    verifyJWT,
    loggoutUser
);

router.route("/refreshtoken").post(
    refreshAccessToken
)


export default router;