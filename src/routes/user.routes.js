import { Router } from "express";
import { registerUser } from "../controller/user.controller.js";
import { upload } from "../middlewares/multter.middlewares.js"

const router = Router();


router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverimage", maxCount: 1 }
    ]),
    registerUser
);



export default router;