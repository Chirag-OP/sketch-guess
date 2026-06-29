import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import Canvas from '../components/canvas';
import { useLocation, useParams } from 'react-router-dom';
import PlayerCard from '../components/playerCard';
import ToolBar from '../components/toolBox';
import send_sym from '../assets/send.svg'
import WordChoiceEle from '../components/wordChoiceEle';

// add style on button hover
// add animation on waiting for Players section
// redirect players using joinLink to landing page with joinCode autoFilled

function CanvasPage(){
  const [mess, setMess] = useState('');
  const [tool,setTool] = useState('');
  const lineWidthRef=useRef('5');

  const socketRef = useRef(null);
  const location = useLocation();

  const {roomID}=useParams();
  const [userName, setUserName] = useState('');
  const [isHost,setIsHost]=useState(false);
  const [isDrawing, setIsDrawing]= useState(false);
  const [hasGuessed, setHasGuessed]=useState(false);
  const [score,setScore]=useState(0);
  const roleRef=useRef(1);
  const [playerList,setPlayerList] = useState(new Map());
  const [startGame, setStartGame] = useState(false);
  const [messArr,setMessArr] = useState([]);

  const [gameState, setGameState] = useState("Not Started");
  const [round , setRound] = useState(9);
  const drawTimeRef = useRef(90);
  const maxPlayersRef =  useRef(10);

  const [wordChoices,setWordChoices] = useState([]);
  const [chosenWord, setChosenWord] = useState('');
  const playerID = sessionStorage.getItem(roomID);

  const [timer,setTimer] = useState(0);
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on("player_list",(arg)=>{
      console.log(arg);
      const pMap = new Map(arg);
      setPlayerList(pMap);
      const playerData = pMap.get(playerID);
      setUserName(playerData.userName);
      setIsHost(playerData.isHost);
      setScore(playerData.score);
      setIsDrawing(playerData.isDrawing);
      setHasGuessed(playerData.hasGuessed);
    });
    socketRef.current.on('your_turn',(arg)=>{
      setWordChoices(arg);
    });
    socketRef.current.on('update_round_info',(arg)=>{
      setRound(arg.roundNo);
      setGameState(arg.gameState);
      drawTimeRef.current = arg.drawTime;
      maxPlayersRef.current = arg.maxPlayers;
      console.log("RECEIVED", arg);
      console.log(arg);
      if(arg.gameState==="Choosing"){
        socketRef.current.emit('req_game_elements',{roomID,playerID});
      }
      else if(arg.gameState==="Playing"){
        socketRef.current.emit('req_word_to_display',{roomID,playerID});
      }
    })
    socketRef.current.on('word_to_display',(arg)=>{
      setChosenWord(arg);
    })
    socketRef.current.on("chat",(arg)=>{
      setMessArr(prev => [
        ...prev,
        {
          message: arg.mess,
          name: arg.userName,
          isMine: arg.isMine,
          guess: arg.guess
        }
      ]);
    });
    socketRef.current.on('update_timer',(arg)=>{
      setTimer(arg);
    })
    socketRef.current.emit('join_room',{roomID,playerID});
    reqRoundInfo();
    console.log(gameState);
    return () => {
    socketRef.current?.disconnect()
  }
  }, [])
  function startTimer(t){
    setTimer(t);
    const id = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(id);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  }
  function reqRoundInfo(){
    socketRef.current.emit('round_info_req',roomID);
  }
  function handleClick(){
    if(mess.length<=0) return;
    socketRef.current?.emit("chat",{mess,userName,playerID});
    setMess('');
  }
  function handleChange(e){
    setMess(e.target.value);
  }
  function handleStartGame(){
    setStartGame(true);
    socketRef.current.emit('update_game_state',roomID);
  }
    return(
        <div>
          <div className="bg-[#1a1a2e] flex text-3xl p-4 border-b border-violet-600 justify-between">
            <div className="text-orange-500 font-['Press_Start_2P'] flex flex-1"><div className="font-['Press_Start_2P'] text-violet-600">Sketch</div>Guess</div>
            <div className='flex-1 justify-center flex text-gray-200 tracking-widest'>{chosenWord}</div>
            <div className='flex-1 text-gray-200 flex justify-end'>{timer}</div>
          </div>
        <div className='pt-4'>
          <div className='grid grid-cols-24 gap-2'>
            <div className='col-start-2 col-span-3 gap-2 flex flex-col'>
              {[...playerList.entries()].map(([Id,player])=>(
                <PlayerCard key={Id} name={player.userName} isHost={player.isHost} isDrawing={player.isDrawing} score={player.score}></PlayerCard>
              ))}
            </div>
            <div className={`col-span-15 ${gameState!=="Playing" ? 'flex flex-col justify-between items-center min-h-80' : ''}`}>
              {gameState==="Not Started" && (
                <>
                <div></div>
                <div className="font-['Press_Start_2P'] text-gray-300 text-2xl p-2 mt-4"> Waiting For Players . . . </div>
                {isHost ? <div className='w-full'>
                            <button onClick={handleStartGame} 
                            className="border border-white rounded-lg text-white w-full mt-1 self-end font-['Press_Start_2P'] hover:border hover:border-violet-400 hover:text-violet-400 hover:cursor-pointer">
                            Start</button>
                          </div>
                        : <div></div>}
                </>
              )}

              {gameState==="Choosing" && (
                <>
                <div></div>
                {isDrawing ? <div className='w-[30%]'><WordChoiceEle wordsToChoose={wordChoices} socket={socketRef.current}></WordChoiceEle></div> 
                 : <div className="font-['Press_Start_2P'] text-gray-300 text-2xl p-2 mt-4"> Player is Choosing . . . </div>}
                <div></div>
                </>
              )}
              {socketRef.current && gameState==="Playing" &&  <Canvas socket={socketRef.current} tool={tool} role ={roleRef.current} lineWidth={lineWidthRef.current}></Canvas>}
            </div>
            <div className=' col-span-4 flex flex-col justify-end p-1'>
              {messArr.map((i,idx)=>(
                <div className={`rounded-lg p-1 break-all w-[80%] text-gray-200 ${i.guess==="Correct" ? 'text-green-400' : i.guess==="inCorrect" ? 'text-red-400' : ' '}` } key={idx}>
                  <div></div>{i.name}: {i.message}</div>
              ))}
              <div className=''>
                {!isDrawing && !hasGuessed && <><input type="text" onChange={handleChange} onKeyDown={(e)=>{
                  if(e.key==='Enter'){
                  handleClick();
                  }
                }} 
                 value={mess} className='bg-gray-200 rounded-xl m-1'/>
                <button onClick={handleClick} 
                  className='bg-gray-300 rounded-lg p-1 ml-1 hover:scale-105 transition-all duration-300'>
                  <img  src={send_sym} alt="" />
                </button></>}
              </div>
            </div>
          </div>
      </div>
      {startGame && <ToolBar setTool={setTool} role={roleRef.current} lineWidth={lineWidthRef.current}></ToolBar>}
      </div>
    )
}
export default CanvasPage;