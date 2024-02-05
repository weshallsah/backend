import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import e from "express";
import Jwt from "jsonwebtoken";

const GenrateToken = async (userID) => {
    try {

        const user = await User.findById(userID);
        // console.log(user._id);
        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();
        user.RefreshToken = RefreshToken;
        // console.log("AccessToken :", AccessToken);
        // console.log("RefreshToken :", RefreshToken);
        await user.save({ validateBeforeSave: false });
        return { AccessToken, RefreshToken };
    } catch (error) {
        console.log(error.message);
        throw new ApiError(500, "something went wrong while genrating token");
    }
}

const option = {
    httpOnly: true,
    secure: true,
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
        "-password -RefreshToken"
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
    // console.log(username);
    if (!username && !email) {
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

    const { AccessToken, RefreshToken } = await GenrateToken(user._id);
    // console.log(AccessToken);
    const loggedInUser = await User.findById(user._id).select("-password -RefreshToken");

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

const loggoutUser = asyncHandler(async (req, res) => {
    const id = req.user._id;
    await User.findByIdAndUpdate(id,
        {
            $set: {
                RefreshToken: undefined,
            },

        },
        {
            new: true,
        }
    );
    const option = {
        httpOnly: true,
        secure: true,
    };
    return res.status(200)
        .clearCookie("AccessToken", option)
        .clearCookie("RefreshToken", option)
        .json(
            new ApiResponse(
                200,
                {},
                "user loggedout successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const inComingRefreshToken = await req.cookie.RefreshToken || req.body.RefreshToken;
        if (!inComingRefreshToken) {
            throw new ApiError(200, "RefreshToken required");
        }
        const decodedToken = Jwt.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(404, "Invalid Refresh Token");
        }
        if (inComingRefreshToken != user?.RefreshToken) {
            throw new ApiError(401, "Refresh Token is expired");
        }
        const { AccessToken, newRefreshToken } = await GenrateToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -RefreshToken");

        return res.status(200)
            .cookie("AccessToken", AccessToken, option)
            .cookie("newRefreshToken", newRefreshToken, option)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser, AccessToken, newRefreshToken
                    },
                    "AccessToken refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(501, "Server Error please try again later");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const iscorrect = await user.ispasswordCorrect(oldPassword);
    if (!iscorrect) {
        throw new ApiError(400, "invalid password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password change successfully"
        )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "current user get successfully"
        )
    );
});

const updateUser = asyncHandler(async (req, res) => {
    const { fullname, username, email } = req.body;
    if (!fullname || !password) {
        throw new ApiError(200, "updation field is required");
    }
    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname: fullname,
                email: email,
            }
        },
        { new: true },
    ).select("-passwrod");
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "user detail updated successfully",
        )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const { username } = req.query;
        console.log(username);
        // console.log(req.params);
        // console.log(req.params.querydata);
        if (!username?.trim()) {
            throw new ApiError(400, "username is missing");
        }
        const channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscriber"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribed"
                }
            },
            {
                $addFields: {
                    subscribercount: {
                        $size: "$subscriber"
                    },
                    subscribedcount: {
                        $size: "$subscribed"
                    },
                    // subid: "$subscriber.subscriber",
                    issubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscriber.subscriber"] },
                            then: true,
                            else: false,
                        }
                    }
                }
            },
            {
                $project: {
                    subid: 1,
                    fullname: 1,
                    username: 1,
                    subscribercount: 1,
                    subscribedcount: 1,
                    avatar: 1,
                    coverimage: 1,
                    issubscribed: 1,
                }
            }
        ]);
        console.log(channel);
        if (!channel) {
            throw new ApiError(
                404,
                "channel not found"
            );
        }
        return res.status(200).json(
            new ApiResponse(
                200,
                channel,
                "get data successfull"
            )
        );
    } catch (error) {

    }
});

export {
    registerUser,
    Loginuser,
    loggoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUser,
    getUserProfile,
};