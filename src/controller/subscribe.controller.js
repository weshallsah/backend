import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"

const subscribe = asyncHandler(async (req, res) => {
    //user want to subscribe 
    //user is authenticated or not
    // who to subscribe (for what channel)
    //
    try {
        const { channelName } = req.body;
        const user = await User.findById(req.user._id);
        const channel = await User.findOne({ username: channelName });
        await Subscription.create({
            subscriber: user,
            channel: channel
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "subscribe successfully"
                )
            );

    } catch (error) {
        return new ApiError(505, "Server error please try again");
    }
});

const unsubscribe = asyncHandler(async (req, res) => {
    try {
        const { channelName } = req.body;
        await Subscription.findOneAndDelete(channelName);
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "unsubscribe successfull"
            )
        );
    } catch (error) {
        throw new ApiError(505, "Server error please try again")
    }
});


export {
    subscribe,
    unsubscribe,
};