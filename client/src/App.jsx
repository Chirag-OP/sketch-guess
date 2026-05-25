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

    const resizeCanvas=()=>{
      const w=canvasContRef.current.clientWidth;
      const ratio=window.devicePixelRatio;
      canvas.width= w* ratio;
      canvas.height=500 * ratio;
      canvas.style.width=`${w}px`;
      canvas.style.height=`${500}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
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
    if(tool && tool!=='pencil' && tool!='line'){
      xRef.current=offsetX
      yRef.current=offsetY;
      return;
    }
    isDrawingRef.current=true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX,offsetY);
  }
  function finishDrawing(e){
    const {offsetX, offsetY}=e.nativeEvent;
    const x=xRef.current;
    const y=yRef.current;
    if(tool && tool==='rectangle') ctxRef.current.strokeRect(x,y,offsetX-x,offsetY-y);
    else if(tool && tool==='circle'){
      const radius=Math.sqrt((offsetX-x)**2+(offsetY-y)**2);
      ctxRef.current.beginPath();
      ctxRef.current.arc(x,y,radius,0,Math.PI*2,true);
      ctxRef.current.stroke();
    }
    else if(tool && tool==='line'){
      ctxRef.current.lineTo(offsetX,offsetY);
      ctxRef.current.stroke();
    }
    isDrawingRef.current=false;
  }
  function draw(e){
    if(!tool || tool!=='pencil') return;
    if(!isDrawingRef.current) return;
    const {offsetX, offsetY}=e.nativeEvent;
    ctxRef.current.lineTo(offsetX,offsetY);
    ctxRef.current.stroke();
  }
  function clearDrawing(){
    ctxRef.current.clearRect(0,0,1000,500);
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
