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
class PlayerData{
    constructor(userName,score,isHost,isDrawing,joinTime,hasGuessed){
        this.userName=userName;
        this.score=score;
        this.isHost=isHost;
        this.isDrawing=isDrawing;
        this.joinTime=joinTime;
        this.hasGuessed=hasGuessed
    }
}
const scoreTable = new Map();
io.on("connection",(socket)=>{
    socket.on("join_room",({playerID,roomID,user,host,isDrawing,score,hasGuessed,joinTime})=>{
        socket.join(roomID);
        socket.data.roomID=roomID;
        console.log(user)
        console.log(host)
        if(!scoreTable.has(roomID)){
            const mp=new Map();
            mp.set(playerID, new PlayerData(user,0,host,isDrawing,joinTime,hasGuessed));
            scoreTable.set(roomID,mp);
        }
        else scoreTable.get(roomID).set(playerID , new PlayerData(user,0,host,isDrawing,joinTime,hasGuessed));
        io.to(socket.data.roomID).emit("player_list",Array.from(scoreTable.get(roomID).entries()));
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