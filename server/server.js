import express from 'express'
import cors from 'cors'
import { Server } from "socket.io";
import {createServer} from 'http';
const app = express();
app.use(cors());
app.use(express.json());
// if servre give error on get(playerID) just redirect the player to landing page
const server= createServer(app)
const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods: ['GET','POST']
    }
})
const words = [
  "Apple",
  "House",
  "Car",
  "Tree",
  "Bicycle",
  "Cat",
  "Dog",
  "Book",
  "Chair",
  "Pizza",
  "Airplane",
  "Mountain",
  "Sunflower",
  "Guitar",
  "Rocket",
  "Castle",
  "Umbrella",
  "Dinosaur",
  "Treasure",
  "Robot"
];
class PlayerData{
    constructor(userName,score,isHost,isDrawing,joinTime,hasGuessed,socketID=''){
        this.userName=userName;
        this.score=score;
        this.isHost=isHost;
        this.isDrawing=isDrawing;
        this.joinTime=joinTime;
        this.hasGuessed=hasGuessed;
        this.socketID = socketID;
    }
}
class RoundInfo{
    constructor(roundNo,drawTime,maxPlayers,gameState){
        this.roundNo = roundNo;
        this.drawTime = drawTime;
        this.maxPlayers = maxPlayers;
        this.gameState = gameState;
    }
}
class GameEvents{
    constructor(wordsToChoose, drawer){
        this.wordsToChoose = wordsToChoose;
        this.drawer = drawer;
    }
}
let i=0;
function chooseDrawer(){
    let roundChange = false;
    if(i>=iterArr.length){
        i=0;
        roundChange=true;
    }
    if(!roundChange) return [iterArr[i++],roundChange];
    return [iterArr[i],roundChange];
}
function choose3Words(){
    const w1 =Math.floor(Math.random() * words.length);
    const w2 =Math.floor(Math.random() * words.length);
    const w3 =Math.floor(Math.random() * words.length);
    return [words[w1],words[w2],words[w3]];
}
function sendUpdatedPlayerData(roomID){
    const players = Array.from(scoreTable.get(roomID).entries());
    // console.log(players);
    io.to(roomID).emit("player_list", players);
}
const scoreTable = new Map();
const roundInfoMap = new Map();
const gameEleMap = new Map();
const iterArr=[];

io.on("connection",(socket)=>{
    // need to add check if player can join or not
    socket.on("add_player",({playerID,roomID,userName,isHost,isDrawing,score,hasGuessed,joinTime})=>{
        // console.log(userName)
        // console.log(isHost)
        iterArr.push(playerID);
        if(!scoreTable.has(roomID)){
            const mp=new Map();
            mp.set(playerID, new PlayerData(userName,score,isHost,isDrawing,joinTime,hasGuessed));
            scoreTable.set(roomID,mp);
        }
        else scoreTable.get(roomID).set(playerID , new PlayerData(userName,score,isHost,isDrawing,joinTime,hasGuessed));
    })
    socket.on("join_room",({roomID,playerID})=>{
        socket.join(roomID);
        socket.data.roomID = roomID;
    
        const player = scoreTable.get(roomID).get(playerID);
        if(player.socketID){ 
            // io.sockets.sockets is a map Socket.io maintains internally of all 
            // currently connected sockets, keyed by their ID
            const oldSocket = io.sockets.sockets.get(player.socketID); 
            // makes the socketID string into a socket object since leaving 
            // requires socket object itself
            if(oldSocket) oldSocket.leave(roomID);   
        }
        player.socketID = socket.id;
        sendUpdatedPlayerData(roomID);
    })
    socket.on("chat",(arg)=>{
        // console.log(arg);
        socket.to(socket.data.roomID).emit("chat",arg);
    })
    socket.on("drawing",(arg)=>{
        io.to(socket.data.roomID).emit("drawing",arg);
    })
    socket.on('round_info', ({roomID,rounds,drawTime,players,gameState})=>{
        roundInfoMap.set(roomID,new RoundInfo(rounds,drawTime,players,gameState));
        console.log(roomID,rounds,drawTime,players,gameState)
    })
    socket.on('round_info_req',(arg)=>{
        console.log('round_info_req | socket:', socket.id);
        socket.emit('update_round_info', roundInfoMap.get(arg));
    })
    socket.on('word_choice',(arg)=>{
        // write word save logic and send to everyone
    });
    socket.on('update_game_state',(arg)=>{
        const w= choose3Words();
        console.log(w);
        const [drawer, roundChange] = chooseDrawer();
        if(roundChange){
            const currRound = roundInfoMap.get(arg).roundNo;
            if(currRound===1){
                roundInfoMap.get(arg).gameState = "gameEnd";
            }
            else{
                roundInfoMap.get(arg).roundNo -=1;
                roundInfoMap.get(arg).gameState = "roundEnd";
            }
            io.to(arg).emit('update_round_info', roundInfoMap.get(arg));
        }
        else{
            roundInfoMap.get(arg).gameState = "Choosing";
            scoreTable.get(arg).get(drawer).isDrawing = true;
            io.to(arg).emit('update_round_info',roundInfoMap.get(arg));
            io.to(scoreTable.get(arg).get(drawer).socketID).emit('your_turn',w);
            if(!gameEleMap.has(arg)) gameEleMap.set(arg,new GameEvents(w,drawer));
        }
        sendUpdatedPlayerData(arg);
    })
    socket.on('req_game_elements',({roomID,playerID})=>{
        const roomState = roundInfoMap.get(roomID);
        console.log(roomState);
        const player = scoreTable.get(roomID)?.get(playerID);
        console.log(player);
        if (roomState?.gameState !== "Choosing") return;
        if (!player?.isDrawing) return;
    
        const words = gameEleMap.get(roomID)?.wordsToChoose;
        if (!words) return;
        socket.emit('your_turn', words);
    })
})
app.get('/api', (req,res)=>{
    res.send("hello")
})
server.listen(3000);