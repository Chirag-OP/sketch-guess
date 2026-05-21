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
    socket.on("chat",(arg)=>{
        console.log(arg);
        socket.broadcast.emit("chat",arg);
    })
})
app.get('/api', (req,res)=>{
    console.log("hello got a get request here");
    res.send("hello")
})
server.listen(3000);