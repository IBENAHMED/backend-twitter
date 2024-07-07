import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
    },
    fullName: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
        minLenght: 6,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    // users following this user
    follwers: [
        {
            type: mongoose.Schema.Types.ObjectId, // type ObjectId 
            ref: "User",
            default: []
        }
    ],
    // this user following these users 
    follwing: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    profileImg: {
        type: String,
        default: ""
    },
    coverImg: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },

    // les postes liked by this user  
    likedPost: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: []
        }
    ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;