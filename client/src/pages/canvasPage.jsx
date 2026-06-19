import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import Canvas from '../components/canvas';
import { useLocation, useParams } from 'react-router-dom';
import PlayerCard from '../components/playerCard';
import ToolBar from '../components/toolBox';
import send_sym from '../assets/send.svg'

// add style on button hover
// add animation on waiting for Players section
// redirect players using joinLink to landing page with joinCode autoFilled

function CanvasPage(){
  const [value, setValue] = useState('')
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
  const roomIDRef=useRef('');
  const roleRef=useRef(1);
  const [playerList,setPlayerList] = useState(new Map());
  const [startGame, setStartGame] = useState(false);
  const [messArr,setMessArr] = useState([]);

  const [gameState, setGameState] = useState('');
  const [round , setRound] = useState(9);
  const drawTimeRef = useRef(90);
  const maxPlayersRef =  useRef(10);
  
  const playerID = sessionStorage.getItem(roomID);
  useEffect(() => {
    socketRef.current = io('http://localhost:3000')
    socketRef.current.emit('join_room',roomID);
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
    })
    socketRef.current.on("chat",(arg)=>{
      setValue(arg.mess);
      const arr = messArr;
      arr.push({message:arg.mess,
        name:arg.userName,
        isMess:true,
        isMine:false
      });
      setMessArr(arr);
    })
    roomIDRef.current=roomID;
    return () => {
    socketRef.current?.disconnect()
  }
  }, [])
  function reqRoundInfo(){
    socketRef.current.emit('round_info_req',roomIDRef.current);
  }
  function updateRoundInfo(){
    socketRef.current.on('update_round_info',(arg)=>{
      setRound(arg.roundNo);
      setGameState(arg.gameState);
      drawTimeRef.current = arg.drawTime;
      maxPlayersRef.current = arg.maxPlayers;
      console.log("RECEIVED", arg);
      console.log(arg);
    })
    reqRoundInfo();
  }
  function handleClick(){
    if(mess.length<=0) return;
    socketRef.current?.emit("chat",{mess,userName});
    const arr = messArr;
      arr.push({message:mess,
        name:userName,
        isMess:true,
        isMine:true
      });
    setMessArr(arr);
    setValue(null);
    setMess('');
  }
  function handleChange(e){
    setMess(e.target.value);
  }
    return(
        <div>
          <div className="bg-[#1a1a2e] flex text-3xl p-4 border-b border-violet-600 font-['Press_Start_2P'] text-orange-500"><div className="text-violet-600">Sketch</div>Guess</div>
        <div className='pt-4'>
          <div className='grid grid-cols-24 gap-2'>
            <div className='col-start-2 col-span-3 gap-2 flex flex-col'>
              {[...playerList.entries()].map(([Id,player])=>(
                <PlayerCard key={Id} name={player.userName} isHost={player.isHost} isDrawing={player.isDrawing} score={player.score}></PlayerCard>
              ))}
            </div>
            <div className={`col-span-15 ${!startGame ? 'flex flex-col justify-between items-center min-h-80' : ''}`}>
              {!startGame && (
                <div></div>
              )}
              {!startGame && (
                <div className="font-['Press_Start_2P'] text-gray-300 text-2xl p-2 mt-4"> Waiting For Players . . . </div>
              )}
              {socketRef.current && startGame &&  <Canvas socket={socketRef.current} tool={tool} role ={roleRef.current} lineWidth={lineWidthRef.current}></Canvas>}
              {!isHost && <div></div>}
              {isHost &&  !startGame && <div className='w-full'><button onClick={()=>
                {setStartGame(true);
                updateRoundInfo();
                }} className="border border-white rounded-lg text-white w-full mt-1 self-end font-['Press_Start_2P']">Start</button></div>}
            </div>
            <div className=' col-span-4 flex flex-col justify-end p-1'>
              {messArr.map((i,idx)=>(
                <div className={`rounded-lg p-1 break-all w-[80%] text-gray-200 ${i.isMine ? '' : ''}` } key={idx}>
                  <div></div>{i.name}: {i.message}</div>
              ))}
              <div className=''>
                <input type="text" onChange={handleChange} onKeyDown={(e)=>{
                  if(e.key==='Enter'){
                  handleClick();
                  }
                }} 
                 value={mess} className='bg-gray-200 rounded-xl m-1'/>
                <button onClick={handleClick} 
                  className='bg-gray-300 rounded-lg p-1 ml-1 hover:scale-105 transition-all duration-300'>
                  <img  src={send_sym} alt="" />
                </button>
              </div>
            </div>
          </div>
      </div>
      {startGame && <ToolBar setTool={setTool} role={roleRef.current} lineWidth={lineWidthRef.current}></ToolBar>}
      </div>
    )
}
export default CanvasPage;