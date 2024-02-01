import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const Token = req.cookies?.AccessToken
            || req.headers?.authorization?.replace("Bearer ", "");
        console.log(req.headers);
        if (!Token) {
            throw new ApiError(401, "unauthorized request");
        }
        const decodedToken = Jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -RefreshToken");
        if (!user) {
            throw new ApiError(401, "unauthorized request");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(505, error?.message || "Invalid access token");
    }
});