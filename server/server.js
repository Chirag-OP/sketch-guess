import express from 'express'
import cors from 'cors'
import { Server } from "socket.io";
import {createServer} from 'http';
import { clearTimeout } from 'timers';
import words from './data/words.js';
const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));
app.use(express.json());
// if servre give error on get(playerID) just redirect the player to landing page
// if host leaves make someone new host
// current code has race condion in 30sec and 10sec rec timer
// what about when drawer disconnects -> nothing game just continues
const server= createServer(app)
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});
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

        this.pausedFrom = null;
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
class Reconnection{
    constructor(roomID,timer,timerId=null){
        this.roomID = roomID;
        this.timer = timer;
        this.timerId = null;
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
        roundInfoMap.get(arg).gameState = "Show Results";
        drawingMap.set(roomID,[]);
        const word = "waiting";
        const w = chosen_word.get(roomID);
        if(w){
            w.word = word;
            w.encoding = word;
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
    const player = scoreTable.get(roomID)?.get(playerID);
    if(!player) return;
    if(player.hasGuessed) return;
    const drawTime = RoundInfo.drawTime;
    const timeLeft = gameEvents.timer;
    const maxPlayers = scoreTable.get(roomID).size;
    player.hasGuessed=true;
    gameEvents.correctGuesses++;
    player.currTurnScore+= Math.floor(50 * (maxPlayers-1) *(timeLeft/drawTime));
    const drawer = gameEvents.drawer;
    if(drawer){
        const drawingPlayer = scoreTable.get(roomID)?.get(drawer);
        if(!drawingPlayer) return;
        drawingPlayer.currTurnScore+=Math.floor(50*(timeLeft/drawTime));
    }
}
function addScore(roomID){
    const room = scoreTable.get(roomID);
    for(const [playerID, player] of room){
        player.score+=player.currTurnScore;
        player.currTurnScore=0;
    }
}
function clearRoom(roomID){
    if(scoreTable.has(roomID)) scoreTable.delete(roomID);
    if(roundInfoMap.has(roomID)) roundInfoMap.delete(roomID);
    if(gameEleMap.has(roomID)) gameEleMap.delete(roomID);
    if(chosen_word.has(roomID)) chosen_word.delete(roomID);
    if(iterArr.has(roomID)) iterArr.delete(roomID);
    if(drawingMap.has(roomID)) drawingMap.delete(roomID);
}
function startRecTimer(playerID,roomID){
    const e = reConnectionMap.get(playerID);
    if(!e) return;
    if (e.timerId) clearTimeout(e.timerId);
    e.timerId = setTimeout(()=>{
        reConnectionMap.delete(playerID);
        const room = scoreTable.get(roomID);
        if(room && room.has(playerID)){
            room.delete(playerID);
            const noOfPlayers = room.size;
            if(noOfPlayers===0){
                clearRoom(roomID);
                return;
            }
            else if(noOfPlayers===1){
                const round = roundInfoMap.get(roomID);
                if(round && round.gameState!=="Not Started"){
                    io.to(roomID).emit("redirect","");
                    clearRoom(roomID);
                    return;
                }
            }
            sendUpdatedPlayerData(roomID);
        }
    },1000*e.timer)
}
const scoreTable = new Map();
const roundInfoMap = new Map();
const gameEleMap = new Map();
const chosen_word = new Map();
const iterArr=new Map();
const drawingMap = new Map();
const reConnectionMap = new Map();
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
                const sid = socket.id;
                const room = scoreTable.get(roomID);
                const alreadyJoined = [...room.values()].some(player => player.socketID === socket.id);
                if (alreadyJoined) {
                    socket.emit("add_player", "Already joined");
                    return;
                }
                scoreTable.get(roomID).set(playerID , new PlayerData(userName,score,isHost,isDrawing,joinTime,hasGuessed,sid));
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
        const round = roundInfoMap.get(roomID);
        const game = gameEleMap.get(roomID);
        if(player.socketID){ 
            // io.sockets.sockets is a map Socket.io maintains internally of all 
            // currently connected sockets, keyed by their ID
            const rec = reConnectionMap.get(playerID);
            if(rec){
                clearTimeout(rec.timerId);
                reConnectionMap.delete(playerID);
            }
            
            const oldSocket = io.sockets.sockets.get(player.socketID); 
            // makes the socketID string into a socket object since leaving 
            // requires socket object itself
            if(oldSocket){
                oldSocket.leave(roomID);   
                oldSocket.disconnect(true);
            }
        }
        player.socketID = socket.id;
        if(round.pausedFrom!==null){
            let activePlayers = 0;
            const room = scoreTable.get(roomID);
            for (const id of room.keys()) {
                if (!reConnectionMap.has(id)) {
                    activePlayers++;
                }
            }
            if (activePlayers >= 2) {
                round.gameState = round.pausedFrom;
                round.pausedFrom = null;
                if (game?.timerId) clearInterval(game.timerId);
                startTimer(roomID);
                io.to(roomID).emit('update_round_info',round);
            }
        }
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
    socket.on('disconnect',()=>{
        if(!socket.data.roomID) return;
        const roomID = socket.data.roomID;
        const playerID = socket.data.playerID;
        const room = scoreTable.get(roomID)
        const round = roundInfoMap.get(roomID);
        if(!reConnectionMap.has(playerID)){
            reConnectionMap.set(playerID, new Reconnection(roomID,30));
        }
        else{
            clearTimeout(reConnectionMap.get(playerID).timerId);
            reConnectionMap.get(playerID).timer = 30;
        }
        if(!room) return;
        let activePlayers = 0;
        for(const id of room.keys()){ 
            if(!reConnectionMap.has(id)){
                activePlayers++;
            }
        }
        if(activePlayers===1){
            const room = roundInfoMap.get(roomID);
            if(room){ 
                const lastState = room.gameState;
                const game = gameEleMap.get(roomID);
                const time = game?.timer;
                const timerId = game?.timerId; 
                if(timerId) clearInterval(timerId); 
                room.gameState="Paused"; 
                round.pausedFrom=lastState;
                game.timer = time;
                io.to(roomID).emit('update_round_info', roundInfoMap.get(roomID)); 
                reConnectionMap.get(playerID).timer = 10;
            } //pause game
        }
        startRecTimer(playerID,roomID);
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
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});