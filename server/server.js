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
        this.currTurnScore =0;
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
        this.correctGuesses=0;
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
function chooseDrawer(roomID) {
    let roundChange = false;
    const players = Array.from(scoreTable.get(roomID)?.keys());
    const room = scoreTable.get(roomID);
    for(let i=0;i<players.length;i++){
        room.get(players[i]).isDrawing = false;
        room.get(players[i]).hasGuessed = false;
    }
    let i = iterArr.get(roomID);
    if(i>=players.length) {
        i= -1;
        roundChange=true;
    }
    const drawer=players[i];
    iterArr.set(roomID, i + 1);

    return [drawer, roundChange];
}
function choose3Words(){
    const w1 =Math.floor(Math.random() * words.length);
    const w2 =Math.floor(Math.random() * words.length);
    const w3 =Math.floor(Math.random() * words.length);
    return [words[w1],words[w2],words[w3]];
}
function sendUpdatedPlayerData(roomID){
    const players = Array.from(scoreTable.get(roomID)?.entries());
    io.to(roomID).emit("player_list", players);
}
function findDrawer(roomID){
    for(const [key,val] of scoreTable.get(roomID)){
        if(val.isDrawing) return val.socketID;
    }
    return null;
}
function startTimer(roomID){
    const event = gameEleMap.get(roomID);
    event.timerId = setInterval(()=>{
        const roundInfo = roundInfoMap.get(roomID);
        const currState = roundInfo.gameState;
        const maxPlayers = scoreTable.get(roomID).size;
        const correctGuesses = gameEleMap.get(roomID)?.correctGuesses;
        if(currState==="Playing" && correctGuesses===maxPlayers-1){
            event.timer =0;
            clearInterval(event.timerId);
            updateGameState(roomID);
            return;
        }
        if(event.timer<=1){
            event.timer =0;
            clearInterval(event.timerId);
            if(currState==="Choosing"){
                const socketID = findDrawer(roomID);
                if(socketID){
                    sendWordToDisplay(gameEleMap.get(roomID).wordsToChoose[0],roomID,socketID);
                    updateGameState(roomID);
                }
            }
            else if(currState==="Playing") updateGameState(roomID);
            else if(currState==="Show Results" || currState==="Round End"){
                addScore(roomID);
                sendUpdatedPlayerData(roomID);
                roundInfoMap.get(roomID).gameState="Next Turn";
                updateGameState(roomID);
            }
        }
        else event.timer-=1;
        io.to(roomID).emit('update_timer',event.timer);
    },1000)
}
function updateGameState(roomID){
    const currState = roundInfoMap.get(roomID)?.gameState;
    const arg=roomID
    if(currState==="Not Started" || currState==="Next Turn"){
        const w= choose3Words();
        console.log(w);
        console.log(iterArr);
        const [drawer, roundChange] = chooseDrawer(arg);
        if(roundChange){
            const currRound = roundInfoMap.get(arg).roundNo;
            if(currRound===1){
                roundInfoMap.get(arg).roundNo -=1;
                roundInfoMap.get(arg).gameState = "Game End";
            }
            else{
                roundInfoMap.get(arg).roundNo -=1;
                roundInfoMap.get(arg).gameState = "Round End";
                gameEleMap.get(roomID).timer = 5;
                startTimer(roomID);
            }
            io.to(arg).emit('update_round_info', roundInfoMap.get(arg));
            return;
        }
        roundInfoMap.get(arg).gameState = "Choosing";
        scoreTable.get(arg).get(drawer).isDrawing = true;
        sendUpdatedPlayerData(roomID);
        console.log("after");
        console.log(iterArr);
        io.to(arg).emit('update_round_info',roundInfoMap.get(arg));
        io.to(scoreTable.get(arg).get(drawer).socketID).emit('your_turn',w);
        if(!gameEleMap.has(arg)) gameEleMap.set(arg,new GameEvents(w,drawer,15));
        else{
            const game = gameEleMap.get(arg);
            game.wordsToChoose = w;
            game.drawer = drawer;
            game.timer = 15;
            game.correctGuesses = 0;
        }
        startTimer(arg);
    }
    else if(currState==="Choosing"){
        roundInfoMap.get(arg).gameState = "Playing";
        io.to(arg).emit('update_round_info',roundInfoMap.get(arg));
    }
    else if(currState==="Playing"){
        addCurrTurnScore(roomID,"drawer");
        sendUpdatedPlayerData(roomID);
        roundInfoMap.get(arg).gameState = "Show Results";
        drawingMap.set(roomID,[]);
        const word = "waiting";
        const w = chosen_word.get(roomID);
        if(w){
            w.word = word;
            w.encoding = word;
            console.log(w.word);
        }
        io.to(arg).emit('word_to_display',word);
        io.to(arg).emit('update_round_info',roundInfoMap.get(arg));
        gameEleMap.get(roomID).timer = 5;
        startTimer(roomID);
    }
}
function sendWordToDisplay(word,roomID,socketID){
    const arg=word;
    io.to(socketID).emit('word_to_display',arg);
    let encodedWord = '';
    for(let i=0;i<arg.length;i++) encodedWord+="_";
    if(!chosen_word.has(roomID)){
        chosen_word.set(roomID,new wordToDisplay(arg,encodedWord));
    }
    else{
        chosen_word.get(roomID).word = arg;
        chosen_word.get(roomID).encoding = encodedWord;
    }
    io.to(roomID).except(socketID).emit('word_to_display',encodedWord);
    const intervalID = gameEleMap.get(roomID).timerId;
    if(intervalID) clearInterval(intervalID);
    gameEleMap.get(roomID).timer=roundInfoMap.get(roomID).drawTime;
    startTimer(roomID);
}
function addCurrTurnScore(roomID,playerID){
    const RoundInfo = roundInfoMap.get(roomID);
    const gameEvents = gameEleMap.get(roomID);
    if(!RoundInfo || !gameEvents) return;
    if(playerID==="drawer"){
        playerID = gameEvents.drawer;
        if(!playerID) return;
        const player = scoreTable.get(roomID)?.get(playerID);
        if(!player) return;
        player.currTurnScore+=(50*gameEvents.correctGuesses);
        return;
    }
    const player = scoreTable.get(roomID)?.get(playerID);
    if(!player) return;
    if(player.hasGuessed) return;
    const drawTime = RoundInfo.drawTime;
    const timeLeft = gameEvents.timer;
    const maxPlayers = scoreTable.get(roomID).size;
    player.hasGuessed=true;
    gameEvents.correctGuesses++;
    player.currTurnScore+= Math.floor(50 * (maxPlayers-1) *(timeLeft/drawTime));
}
function addScore(roomID){
    const room = scoreTable.get(roomID);
    for(const [playerID, player] of room){
        player.score+=player.currTurnScore;
        player.currTurnScore=0;
    }
}
const scoreTable = new Map();
const roundInfoMap = new Map();
const gameEleMap = new Map();
const chosen_word = new Map();
const iterArr=new Map();
const drawingMap = new Map();
io.on("connection",(socket)=>{
    socket.on("create_room",({playerID,roomID,userName,isHost,isDrawing,score,hasGuessed,joinTime})=>{
        iterArr.set(roomID,0);
        const mp=new Map();
        mp.set(playerID, new PlayerData(userName,score,isHost,isDrawing,joinTime,hasGuessed));
        scoreTable.set(roomID,mp);
    })
    socket.on("add_player",({playerID,roomID,userName,isHost,isDrawing,score,hasGuessed,joinTime})=>{
        if(!scoreTable.has(roomID)){
            socket.emit('add_player',"Room Doesn't exist");
        }
        else {
            const currSize = scoreTable.get(roomID).size;
            const maxPlayers = roundInfoMap.get(roomID).maxPlayers;
            if(currSize==maxPlayers) socket.emit('add_player',"Room is full");
            else{
                scoreTable.get(roomID).set(playerID , new PlayerData(userName,score,isHost,isDrawing,joinTime,hasGuessed));
                socket.emit('add_player',"success");
            }
        }
    })
    socket.on("join_room",({roomID,playerID})=>{
        if(!scoreTable.has(roomID)){
            socket.emit('redirect',"");
            return;
        }
        const player = scoreTable.get(roomID)?.get(playerID);
        if(!player){
            socket.emit('redirect',roomID);
            return;
        }
        socket.join(roomID);
        socket.data.roomID = roomID;
        socket.data.playerID = playerID;
        if(player.socketID){ 
            // io.sockets.sockets is a map Socket.io maintains internally of all 
            // currently connected sockets, keyed by their ID
            const oldSocket = io.sockets.sockets.get(player.socketID); 
            // makes the socketID string into a socket object since leaving 
            // requires socket object itself
            if(oldSocket){
                oldSocket.leave(roomID);   
                oldSocket.disconnect(true);
            }
        }
        player.socketID = socket.id;
        sendUpdatedPlayerData(roomID);
    })
    socket.on("chat",({mess,userName,playerID})=>{
        const roomID = socket.data.roomID;
        if(roundInfoMap.get(roomID).gameState!=="Playing"){
            socket.to(roomID).emit("chat",{mess, userName , isMine:false , guess:"No"});
            socket.emit("chat",{mess,userName,isMine:true,guess:"No"});
        }
        else{
            if(mess.toLowerCase()===chosen_word.get(roomID).word.toLowerCase()){
                addCurrTurnScore(roomID,playerID);
                socket.to(roomID).emit("chat",{mess:"Guessed Correctly", userName , isMine:false , guess:"Correct"});
                socket.emit("chat",{mess,userName,isMine:true,guess:"Correct"});
                sendUpdatedPlayerData(roomID);
                socket.emit('word_to_display',chosen_word.get(roomID).word);
            }
            else{
                socket.to(roomID).emit("chat",{mess, userName , isMine:false , guess:"inCorrect"});
                socket.emit("chat",{mess,userName,isMine:true,guess:"inCorrect"});
            }
        }

    })
    socket.on("drawing",(arg)=>{
        const roomID= socket.data.roomID;
        drawingMap.set(roomID,arg);
        io.to(roomID).emit("drawing",arg);
    })
    socket.on('req_drawing',(arg)=>{
        const roomID = socket.data.roomID;
        const currState = roundInfoMap.get(roomID)?.gameState;
        if(currState==="Playing") socket.emit("drawing",drawingMap.get(roomID) ?? []);
    })
    socket.on('round_info', ({roomID,rounds,drawTime,players,gameState})=>{
        roundInfoMap.set(roomID,new RoundInfo(
            Number(rounds),
            Number(drawTime),
            Number(players),
            gameState));
    })
    socket.on('round_info_req',(arg)=>{
        socket.emit('update_round_info', roundInfoMap.get(arg));
    })
    socket.on('word_choice',(arg)=>{
        const roomID = socket.data.roomID;
        sendWordToDisplay(arg,roomID,socket.id);
        updateGameState(roomID);
    });
    socket.on('update_game_state',(arg)=>{
        updateGameState(arg);
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
        const player = scoreTable.get(roomID)?.get(playerID);
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
app.get("/final_results/:roomID",(req,res)=>{
    try{
        const roomID = req.params.roomID;
        if(!scoreTable.has(roomID)){
            return res.status(404).json({
                error:'Room Not Found'
            })
        }
        const players = Array.from(scoreTable.get(roomID).values());
        players.sort((a,b)=>{
            return b.score-a.score;
        })
        res.json(players);
    }catch(err){
        res.status(500).json({
           error: 'Internal Server Error'
    });
    }
})
server.listen(3000);