import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        // user created this post
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        img: {
            type: String,
        },

        // les users who liked this poste
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // les users who comment this poste
        comments: [
            {
                text: {
                    type: String,
                    required: true,
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;