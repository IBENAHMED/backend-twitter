import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export let authentification = async (req, res, next) => {
    const token = req.headers['token-auth'];

    try {

        if (!token) {
            return res.status(401).json({
                error: "User not authentificatied"
            });
        };

        let decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({
                error: "token not decode"
            });
        };


        let user = await User.findById({ _id: decode.id }).select("-password");

        if (!user) {
            return res.status(400).json({
                error: "user not found"
            });
        };

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    };
}