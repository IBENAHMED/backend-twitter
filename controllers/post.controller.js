import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';

export let createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        let userId = req.user._id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ error: "the user not authentificatied" })
        }

        if (!img && !text) {
            return res.status(400).json({ error: "the post must have text and image" })
        };

        // Upload an image

        if (img) {
            const uploadResultProfile = await cloudinary.uploader.upload(`${img}`);
            img = uploadResultProfile.secure_url;
        }

        let post = await new Post({
            user: userId,
            text,
            img,
        });

        await post.save();
        res.status(201).json({
            message: "the post created successfuly"
        })
    } catch (error) {
        res.status(500).json({
            error: error
        });
    };
};

export let deletePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(400).json({ error: "You are not authorized to delete this post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }


        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "the post deleted successfuly"
        })
    } catch (error) {
        res.status(500).json({
            error: error
        });
    };
};

export let commentOnPost = async (req, res) => {

    try {
        let postId = req.params.id;
        let userId = req.user._id;
        let { text } = req.body;

        let post = await Post.findById(postId);
        if (!post) {
            res.status(400).json({
                error: "the post not avilable"
            });
        };

        if (!text) {
            res.json({
                error: "you must put the text"
            });
        };

        let comment = { text, user: userId };
        post.comments.push(comment);
        await post.save();

        let postUpdated = await Post.findById(postId).populate({ path: "comments.user", select: "-password" });

        res.status(200).json(postUpdated);

    } catch (error) {
        res.status(500).json({
            error: "Intirval Error Server"
        });
    }
};

export let likeUnlikePost = async (req, res) => {
    try {
        let postId = req.params.id;
        let userId = req.user._id;

        let post = await Post.findById(postId);
        if (!post) {
            res.status(400).json({
                error: "the post not avilable"
            });
        };

        // check user if He has already like this post
        let checkUserIfLikePost = post.likes.includes(userId);
        if (checkUserIfLikePost) {
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPost: postId } });

            await post.save();

            let postUpdatedLikes = await Post.findById(postId);
            let updatedLikes = postUpdatedLikes.likes.filter((id) => id !== userId);

            res.status(200).json(updatedLikes);

        } else {
            await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });
            await User.updateOne({ _id: userId }, { $push: { likedPost: postId } });

            await post.save();

            // Send notification
            let notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            });

            await notification.save();

            let postUpdatedLikes = await Post.findById(postId);
            let updatedLikes = postUpdatedLikes.likes.filter((id) => id !== userId);

            res.status(200).json(updatedLikes)
        };

    } catch (error) {
        res.status(500).json({
            error: "Invalid Server Error"
        });
    };
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) // sort post by last arrivales
            .populate({ path: "user", select: "-password" }) // give all details about user post expect password
            .populate({ path: "comments.user", select: "-password" }) // give all details about user comments expect password

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getLikedPosts = async (req, res) => {

    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const likedPosts = await Post.find({ _id: { $in: user.likedPost } })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error in getLikedPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        let userId = req.user._id;
        let user = await User.findById(userId.toString());
        if (!user) {
            res.json({ error: "we can't found this user" })
        };

        // First Way
        // let post = await Post.find().populate({ path: "user", select: "-password" });
        // if (!post) {
        //     res.json({ error: "we can't post any post" })
        // };
        // let getUserFollowingPosts = post.filter((post) => post.user.follwers.toString() == userId.toString())
        // res.json(getUserFollowingPosts)

        // Seconed Way
        const following = user.follwing;

        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(feedPosts);

    } catch (error) {
        res.json({
            error: error.message
        });
    };
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getUserPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    };
};