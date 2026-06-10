import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import ToolBar from '../components/toolBox';
import { useLocation, useParams } from 'react-router-dom';
import PlayerCard from '../components/playerCard';
// on reload copy of same player is added again
// add style on button hover
// add name while sending chat
function CanvasPage(){
  const [value, setValue] = useState('')
  const [mess, setMess] = useState('');
  const socketRef = useRef(null);
  const [tool,setTool] = useState('');
  const xRef=useRef(null);
  const yRef=useRef(null);
  const canvasRef=useRef(null);
  const ctxRef=useRef(null);
  const isDrawingRef=useRef(false);
  const canvasContRef=useRef('');
  const drawingArr = useRef([]);
  const redrawRef=useRef('');
  const lineWidthRef=useRef('5');
  const location = useLocation();
  const {roomID}=useParams();
  const [userName, setUserName] = useState('');
  const [isHost,setIsHost]=useState(false);
  const [isDrawing, setIsDrawing]= useState(false);
  const [hasGuessed, setHasGuessed]=useState(false);
  const [score,setScore]=useState(0);
  const roomIDRef=useRef('');
  const roleRef=useRef(1);
  // let playerID= localStorage.getItem('playerID');
  const [playerList,setPlayerList] = useState(new Map());
  const [startGame, setStartGame] = useState(false);
  const [messArr,setMessArr] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3000/api')
    .then((res)=>{
      return res.text();
    })
    .then((data)=>{
    })
    socketRef.current = io('http://localhost:3000')
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
    // if(!playerID){
    //   const pID = crypto.randomUUID();
    //   localStorage.setItem('playerID',pID);
    //   playerID=pID;
    // }
    const playerID = crypto.randomUUID();
    let user= location.state?.userName;
    let host=location.state?.isHost;
    let joinTime = location.state?.joinTime;
    // if(playerList.has(playerID)){
    //   user = playerList.get(playerID).userName;
    //   host = playerList.get(playerID).isHost;
    //   joinTime = playerList.get(playerID).joinTime;
    // }
    setUserName(user);
    setIsHost(host);
    console.log(user);
    console.log(host);
    // update the logic to get server to verify the username and ishost
    roomIDRef.current=roomID;
    socketRef.current.emit("join_room",{playerID,roomID,user,host,isDrawing,score,hasGuessed,joinTime});
    socketRef.current.on("player_list",(arg)=>{
      console.log(arg);
      setPlayerList(new Map(arg))
      
    })
    const canvas=canvasRef.current;
    const ctx=canvas.getContext('2d');
    const redraw=()=>{
      ctx.strokeStyle='black';
      ctx.clearRect(0,0,1000,500);
      for(const d of drawingArr.current){
        const type = d.tool;
        if(type==='pencil'){
          ctx.beginPath();
          ctx.moveTo(d.startX, d.startY);
          ctx.lineTo(d.finishX,d.finishY);
          ctx.stroke();
        }
        else if(type==='rectangle'){
          ctx.strokeRect(d.startX,d.startY,d.finishX-d.startX,d.finishY-d.startY);
        }
        else if(type==='circle'){
          const radius=Math.sqrt((d.finishX-d.startX)**2+(d.finishY-d.startY)**2);
          ctx.beginPath();
          ctx.arc(d.startX,d.startY,radius,0,Math.PI*2,true);
          ctx.stroke();
        }
        else if(type==='line'){
          ctx.beginPath();
          ctx.moveTo(d.startX, d.startY);
          ctx.lineTo(d.finishX,d.finishY);
          ctx.stroke();
        }
        else if(type==='eraser'){
          ctx.strokeStyle='white';
          ctx.beginPath();
          ctx.moveTo(d.startX, d.startY);
          ctx.lineTo(d.finishX,d.finishY);
          ctx.stroke();
          ctx.strokeStyle='black';
        }
      }
    }

    redrawRef.current=redraw;
    socketRef.current.on("drawing",(arg)=>{
      drawingArr.current=arg;
      redraw();
    })
    const resizeCanvas=()=>{
      const w=canvasContRef.current.clientWidth;
      const ratio=window.devicePixelRatio;
      canvas.width= w* ratio;
      canvas.height=500 * ratio;
      canvas.style.width=`${w}px`;
      canvas.style.height=`${500}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      redraw();
    }
    resizeCanvas();
    const observer=new ResizeObserver(() => {
      resizeCanvas();
    });
    observer.observe(canvasContRef.current);
    ctx.lineWidth=lineWidthRef.current;
    ctx.lineCap="round";
    ctxRef.current=ctx;
    return () => {
    socketRef.current?.disconnect()
  }
  }, [])
  function handleClick(){
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
  function startDrawing(e){
    const {offsetX, offsetY}=e.nativeEvent;
    isDrawingRef.current=true;
    xRef.current=offsetX
    yRef.current=offsetY;
    if(tool==='pencil'){
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX,offsetY);
    }
    else if(tool=='eraser'){
      ctxRef.current.strokeStyle='white'
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX,offsetY);
    }
  }
  function finishDrawing(e){
    const {offsetX, offsetY}=e.nativeEvent;
    const x=xRef.current;
    const y=yRef.current;
    if(tool && tool==='rectangle'){
      drawingArr.current.push({
        tool:"rectangle",
        startX:xRef.current,
        startY:yRef.current,
        finishX:offsetX,
        finishY:offsetY
      });
    }
    else if(tool && tool==='circle'){
      drawingArr.current.push({
        tool:"circle",
        startX:xRef.current,
        startY:yRef.current,
        finishX:offsetX,
        finishY:offsetY
      });
    }
    else if(tool && tool==='line'){
      drawingArr.current.push({
        tool:"line",
        startX:xRef.current,
        startY:yRef.current,
        finishX:offsetX,
        finishY:offsetY
      });
    }
    if(roleRef.current===1) socketRef.current?.emit("drawing",drawingArr.current);
    isDrawingRef.current=false;
    redrawRef.current?.();
  }
  function draw(e){
    if(!isDrawingRef.current) return;
    const {offsetX, offsetY}=e.nativeEvent;
    if(tool==='pencil'){
      ctxRef.current.lineTo(offsetX,offsetY);
      ctxRef.current.stroke();
      drawingArr.current.push({
        tool:"pencil",
        startX:xRef.current,
        startY:yRef.current,
        finishX:offsetX,
        finishY:offsetY
      });
      xRef.current=offsetX;
      yRef.current=offsetY;
    }
    else if(tool==='rectangle'){
      ctxRef.current.clearRect(0,0,1000,500);
      redrawRef.current?.();
      ctxRef.current.strokeRect(xRef.current, yRef.current, offsetX-xRef.current, offsetY-yRef.current);
    }
    else if(tool==='circle'){
      ctxRef.current.clearRect(0,0,1000,500);
      redrawRef.current?.();
      let radius=Math.sqrt((offsetX-xRef.current)**2+(offsetY-yRef.current)**2);
      ctxRef.current.beginPath();
      ctxRef.current.arc(xRef.current,yRef.current,radius,0,Math.PI*2,true);
      ctxRef.current.stroke();
    }
    else if(tool==='line'){
      ctxRef.current.clearRect(0,0,1000,500);
      redrawRef.current?.();
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(xRef.current,yRef.current);
      ctxRef.current.lineTo(offsetX,offsetY);
      ctxRef.current.stroke();
    }
    else if(tool==='eraser'){
      ctxRef.current.lineTo(offsetX,offsetY);
      ctxRef.current.stroke();
      drawingArr.current.push({
        tool:"eraser",
        startX:xRef.current,
        startY:yRef.current,
        finishX:offsetX,
        finishY:offsetY
      });
      xRef.current=offsetX;
      yRef.current=offsetY;
    }
  }
  function clearDrawing(){
    ctxRef.current.clearRect(0,0,1000,500);
    drawingArr.current=[];
    if(roleRef.current===1) socketRef.current?.emit("drawing",drawingArr.current);
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
            <div className='col-span-15 ' ref={canvasContRef}>
              <canvas className='bg-white' onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} ref={canvasRef}></canvas>
              {!startGame && <div className='w-full'><button onClick={()=>{setStartGame(true)}} className="border border-white rounded-lg text-white w-full mt-1">Start</button></div>}
            </div>
            <div className=' col-span-4 flex flex-col justify-end p-1'>
              {messArr.map((i,idx)=>(
                <div className={`rounded-lg p-1 break-all w-[80%] text-gray-200 ${i.isMine ? '' : ''}` } key={idx}><div></div>{i.name}: {i.message}</div>
              ))}
              <div className=''><input type="text" onChange={handleChange} value={mess} className='bg-gray-200 rounded-xl m-1'/><button onClick={handleClick} className='border border-white text-white p-2 rounded-lg shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300'>S</button></div>
            </div>
          </div>
      </div>
      {startGame && <ToolBar setTool={setTool} clearDrawing={clearDrawing} role={roleRef.current} lineWidth={lineWidthRef.current}></ToolBar>}
      </div>
    )
}
export default CanvasPage;