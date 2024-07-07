import express from "express";
import dotenv from "dotenv";
import { authRoutes, userRoutes, postRoutes, notificationRoutes } from './routers/index.js';
import { connectMongodb } from "./db/conectMongodb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';


dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const app = express();
const PORT = process.env.PORT || 4000;
// var corsOptions = ;
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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
