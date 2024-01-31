import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import e from "express";

const GenrateToken = async (userID) => {
    try {

        const user = User.findById(userID);
        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();
        user.RefreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false });
        return { AccessToken, RefreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while genrating token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get credential 
    // verify credential
    // get complete profile data
    //check user is alredy exist
    //and create user in db
    //check user create
    const { fullname, email, username, password } = req.body;
    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "please enter the vaild credential");
    }
    const userref = await User.findOne({ $or: [{ username }, { email },] });
    if (userref) {
        throw new ApiError(409, "user is alredy exits");

    }
    const avatarPath = await req.files?.avatar[0]?.path;
    let coverPath = "";
    if (!avatarPath) {
        throw new ApiError("400", "avatar file is required");
    }
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverPath = await req.files.coverimage[0].path;
    }
    // console.log(req.files);
    const avtarref = await uploadonCloud(avatarPath).catch((err) => {
        throw new ApiError("505", "server error");
    });
    const coverref = await uploadonCloud(coverPath);
    if (!avtarref) {
        throw new ApiError("400", "server error please try again later");
    }
    const user = await User.create({
        fullname: fullname,
        email: email,
        avatar: avtarref.url,
        password: password,
        username: username,
        coverImage: coverref.url ?? "",
    });
    const credential = await User.findById(user._id).select(
        "-password"
    );
    if (!credential) {
        throw new ApiError("505", "server errror user not created");
    }
    return res.status(201).json(new ApiResponse(
        201,
        credential,
        "user created successfully",
    ));
});

const Loginuser = asyncHandler(async (req, res) => {
    // check username,email and password to validate
    // check user is in database or not
    // do login and geneate the access token and refresh token
    // and after seasion over then auth by by refresh token and access token
    const { email, username, password } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "username or password is required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(404, "user does not exist");
    }
    const iscorrect = await user.ispasswordCorrect(password);
    if (!iscorrect) {
        throw new ApiError(401, "password is incorrect");
    }

    const { AccessToken, RefreshToken } = GenrateToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -RefreshToken");
    const option = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .cookie("AccessToken", AccessToken, option)
        .cookie("RefreshToken", RefreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, AccessToken, RefreshToken
                },
                "user loggedIn successfully"
            )
        );
});

const loggoutUser = asyncHandler(async (req,res) => { 
    
});

export { registerUser, Loginuser };