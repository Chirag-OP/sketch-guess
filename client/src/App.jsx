import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import './App.css'
import { use } from 'react'

function App() {
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
  useEffect(() => {
    fetch('http://localhost:3000/api')
    .then((res)=>{
      return res.text();
    })
    .then((data)=>{
    })
    socketRef.current = io('http://localhost:3000')
    socketRef.current.on("hello",(arg)=>{
      console.log(arg)
    })
    socketRef.current.on("chat",(arg)=>{
      setValue(arg);
    })
    const canvas=canvasRef.current;
    const ctx=canvas.getContext('2d');

    const redraw=()=>{
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
      }
    }
    redrawRef.current=redraw;
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
    ctx.strokeStyle = 'black';
    ctx.lineWidth=5;
    ctx.lineCap="round";
    ctxRef.current=ctx;
    return () => {
    socketRef.current?.disconnect()
  }
  }, [])
  function handleClick(){
    socketRef.current?.emit("chat",mess);
    setValue(null);
    setMess('');
  }
  function handleChange(e){
    setMess(e.target.value)
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
  }
  function clearDrawing(){
    ctxRef.current.clearRect(0,0,1000,500);
    drawingArr.current=[];
  }
  return (
    <>
    <section className='bg-gray-900 h-screen'>
    <div>
      <div className='flex gap-2'>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('pencil')}}>pencil</button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('rectangle')}}>rectangle</button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('circle')}}>circle</button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('line')}}>line</button>
        <button onClick={clearDrawing} className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300'> Clear </button>
      </div>
        <div className='grid grid-cols-24 gap-2'>
          <div className='col-start-2 col-span-3 bg-white'></div>
          <div className='col-span-15 ' ref={canvasContRef}>
            <canvas className='bg-white' onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} ref={canvasRef}></canvas>
          </div>
          <div className='bg-white col-span-4'>
            <div><input type="text" onChange={handleChange} value={mess} className='bg-gray-100 rounded-xl'/></div>
            <div><button onClick={handleClick} className='bg-amber-200 rounded-lg shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300'>Click Me</button></div>
            <div>{value}</div>
          </div>
        </div>
          
    </div>
    </section>
    </>
  )
}

export default App
