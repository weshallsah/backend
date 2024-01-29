import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
    },
    avtar: {
        type: String,
        required: true,
        trim: true,
    },
    coverImage: {
        type: String,
    },
    WatchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    refreshToken: {
        type: String,
    }
},
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (error, req, res, next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.ispasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return Jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return Jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model('User', userSchema);