import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadonCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    //get credential 
    // verify credential
    // get complete profile data 
    //check user is alredy exist
    //and create user in db
    //check user create
    const { fullname, email, Username, password } = req.body;
    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "please enter the vaild credential");
    }
    const userref = User.findOne({ $or: [{ Username }, { email },] });
    if (userref) {
        throw new ApiError(409, "user is alredy exits");
    }
    // try {
    const avatarURL = req.files?.avatar[0]?.path;
    console.log(avatarURL);
    const coverURL = req.files?.avatar[0]?.path;
    // console.log(avatarURL);
    // } catch (error) {
    //     console.log("error in uploading", error.message);
    // }
    if (!avatarURL) {
        throw new ApiError("400", "avtar file is required");
    }

    const avtarref = await uploadonCloud(avatarURL).catch((err) => {
        throw new ApiError("505", "server error");
    });
    if (!cloudinaryref) {
        throw new ApiError("400", "server error try again later");
    }
    const user = User.create({
        fullname,
        email,
        avtar: avtarref.url,
        password,
        username: Username,
        coverImage: null,
    });
    const credential = await User.findById(user._id).select(
        "-password"
    );
    if (!credential) {
        throw new ApiError("505", "server errror user not created");
    }

    return res.status(201).json(new ApiResponse(
        200,
        credential,
        "user created successfully",
    ));

    // console.log(cloudinaryref);
    // console.log("fullname", fullname);
    // console.log("password", password);
});


export { registerUser };