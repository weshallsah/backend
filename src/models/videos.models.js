import mongoose from "mongoose";
import mongooseAP from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema(
    {
        VideoFile: {
            type: String,
            reuired: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            reuired: true,
        },
        description: {
            type: String,
            reuired: true,
        },
        duretion: {
            type: Number,
            reuired: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAP);

export const Video = mongoose.model('Video', videoSchema);