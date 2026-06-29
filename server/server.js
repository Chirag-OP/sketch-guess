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
    constructor(wordsToChoose, drawer, timer, timerId =null){
        this.wordsToChoose = wordsToChoose;
        this.drawer = drawer;

        this.timer = timer;
        this.timerId= timerId
    }
}
class wordToDisplay{
    constructor(word, encoding){
        this.word = word;
        this.encoding = encoding;
    }
}
function chooseDrawer(roomID){
    let roundChange = false;
    const players = Array.from(scoreTable.get(roomID).keys());
    let i = iterArr.get(roomID);
    if(i>=players.length){
        i=0;
        iterArr.set(roomID,i);
        roundChange=true;
    }
    if(!roundChange){
        iterArr.set(roomID,i+1);
    }
    return [players[i],roundChange];
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
const chosen_word = new Map();
const iterArr=new Map();
io.on("connection",(socket)=>{
    // need to add check if player can join or not
    socket.on("add_player",({playerID,roomID,userName,isHost,isDrawing,score,hasGuessed,joinTime})=>{
        // console.log(userName)
        // console.log(isHost)
        if(!iterArr.has(roomID)) iterArr.set(roomID,0);
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
    
        const player = scoreTable.get(roomID)?.get(playerID);
        if(!player) return;
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
    socket.on("chat",({mess,userName,playerID})=>{
        const roomID = socket.data.roomID;
        console.log(roundInfoMap.get(roomID).gameState);
        console.log(chosen_word.get(roomID));
        console.log(mess);
        if(roundInfoMap.get(roomID).gameState!=="Playing"){
            socket.to(roomID).emit("chat",{mess, userName , isMine:false , guess:"No"});
            socket.emit("chat",{mess,userName,isMine:true,guess:"No"});
        }
        else{
            if(mess.toLowerCase()===chosen_word.get(roomID).word.toLowerCase()){
                socket.to(roomID).emit("chat",{mess:"Guessed Correctly", userName , isMine:false , guess:"Correct"});
                socket.emit("chat",{mess,userName,isMine:true,guess:"Correct"});
                scoreTable.get(roomID).get(playerID).hasGuessed=true;
                const players = Array.from(scoreTable.get(roomID).entries());
                socket.emit("player_list",players)
                socket.emit('word_to_display',chosen_word.get(roomID).word);
            }
            else{
                socket.to(roomID).emit("chat",{mess, userName , isMine:false , guess:"inCorrect"});
                socket.emit("chat",{mess,userName,isMine:true,guess:"inCorrect"});
            }
        }

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
        console.log('wordChosen', arg);
        const roomID = socket.data.roomID;
        roundInfoMap.get(roomID).gameState = "Playing";
        console.log(roundInfoMap.get(roomID));
        io.to(roomID).emit('update_round_info',roundInfoMap.get(roomID));
        socket.emit('word_to_display',arg);
        let encodedWord = '';
        for(let i=0;i<arg.length;i++) encodedWord+="_";
        console.log(encodedWord);
        if(!chosen_word.has(roomID)){
            chosen_word.set(roomID,new wordToDisplay(arg,encodedWord));
        }
        else{
            chosen_word.get(roomID).word = arg;
            chosen_word.get(roomID).encoding = encodedWord;
        }
        socket.to(roomID).emit('word_to_display',encodedWord);
    });
    socket.on('update_game_state',(arg)=>{
        const w= choose3Words();
        console.log(w);
        const [drawer, roundChange] = chooseDrawer(arg);
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
            if(!gameEleMap.has(arg)) gameEleMap.set(arg,new GameEvents(w,drawer,15));
            else gameEleMap.get(arg).timer = 15;
            io.to(arg).emit('start_timer',gameEleMap.get(arg)?.timer);

            // add function call to start the timer 


        }
        sendUpdatedPlayerData(arg);
    })
    socket.on('req_word_to_display',({roomID,playerID})=>{
        const roomState = roundInfoMap.get(roomID);
        if(roomState?.gameState!=="Playing") return;
        if(scoreTable.get(roomID)?.get(playerID)?.isDrawing) socket.emit('word_to_display',chosen_word.get(roomID)?.word);
        else socket.emit('word_to_display',chosen_word.get(roomID)?.encoding);
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