import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser";
dotenv.config();

const secretKeyJWT = process.env.SECRET_JWT;
const port = process.env.PORT || 4000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    })
);

// API's

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get('/login', (req, res) => {
    const token = jwt.sign({ _id: "abc123456de" }, secretKeyJWT)
    console.log("This is token : ", token)

    res.cookie("token", token, { httpOnly: true, secure: true }).json({
        message: "login success",
    })
})

// MiddleWare for Socket . io
io.use((socket, next) => {

    cookieParser()(socket.request, socket.request.res, (err) => {
        if (err) return next(err)

        const token = socket.request.cookies.token
        if (!token) return next(new Error("Authentication Error"))
        next()
    })
})

// For Whole Circuit
// And individual socket
io.on("connection", (socket) => {

    console.log("User Connected Successfully", socket.id);

    // Emit -> every message for every single socket
    socket.emit("Welcome", `Welcome to the Server ${socket.id}`)

    // send to every socket except itself
    socket.broadcast.emit("Broadcast_Message", `${socket.id} joined the same server`)

    socket.on("disconnect", () => {
        console.log(`${socket.id} Leave the server`)
    })
    // But usually we define emit from frontend , and listen at backend

    socket.on("message", (data) => {
        console.log("This Message come from frontend :", data, `: And send by ${socket.id}`)

        const { room, message } = data
        // console.log({ room, message })

        // This below evenet is accessable for every socket
        // socket.broadcast.emit("receive-message", data)

        // io.to(room).emit('receive-message', message)
        socket.to(room).emit('receive-message', message)
    })

    socket.on('join-room', (roomName) => {
        socket.join(roomName)
        console.log(`User Joined ${roomName}`)
    })
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});