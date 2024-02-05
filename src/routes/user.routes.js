import { Router } from "express";
import { Loginuser, registerUser, refreshAccessToken, changeCurrentPassword, updateUser, getUserProfile } from "../controller/user.controller.js";
import { upload } from "../middlewares/multter.middlewares.js"
import { verifyJWT } from "../middlewares/userauth.middlewares.js";
import { loggoutUser, getCurrentUser } from "../controller/user.controller.js";

const router = Router();

router.route("/getuser").post(
    upload.fields([]),
    verifyJWT,
    getUserProfile
);

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

router.route("/updateuserinfo").post(
    upload.fields([]),
    verifyJWT,
    updateUser
);

router.route("/resetpassword").post(
    upload.fields([]),
    verifyJWT,
    changeCurrentPassword
);

router.route("/getuser").post(
    verifyJWT,
    getCurrentUser
);
router.route("/logout").post(
    verifyJWT,
    loggoutUser
);

router.route("/refreshtoken").post(
    refreshAccessToken
)


export default router;