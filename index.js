dotenv.config();
import express from "express";
import dotenv from "dotenv";
import { authRoutes, userRoutes, postRoutes, notificationRoutes } from './routers/index.js';
import { connectMongodb } from "./db/conectMongodb.js";
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const app = express();
const PORT = process.env.PORT || 4000;
// var corsOptions = ;

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.header('Access-Control-Allow-Headers', "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    };
    next();
});

app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// API Routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', postRoutes);
app.use('/', notificationRoutes);

// Start server
app.listen(PORT, (err) => {
    if (err) {
        console.error(`Error: ${err}`);
    } else {
        console.log(`Server running on port ${PORT}`);
        connectMongodb(); // Establish database connection
    }
});
