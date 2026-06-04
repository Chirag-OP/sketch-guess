import express from 'express'
import cors from 'cors'
import { Server } from "socket.io";
import {createServer} from 'http';
const app = express();
app.use(cors());
app.use(express.json());
const server= createServer(app)
const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods: ['GET','POST']
    }
})
io.on("connection",(socket)=>{
    socket.on("join_room",({roomID,userName,isHost})=>{
        socket.join(roomID);
        socket.data.roomID=roomID;
    })
    socket.on("chat",(arg)=>{
        console.log(arg);
        socket.to(socket.data.roomID).emit("chat",arg);
    })
    socket.on("drawing",(arg)=>{
        socket.to(socket.data.roomID).emit("drawing",arg);
    })
})
app.get('/api', (req,res)=>{
    res.send("hello")
})
server.listen(3000);