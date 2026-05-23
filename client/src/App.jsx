import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import './App.css'
import { use } from 'react'

function App() {
  const [value, setValue] = useState('a')
  const [mess, setMess] = useState('');
  const socketRef = useRef(null);

  const canvasRef=useRef(null);
  const ctxRef=useRef(null);
  const isDrawingRef=useRef(false);
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

    const ratio=window.devicePixelRatio;
    canvas.width=1000 * ratio;
    canvas.height=500 * ratio;
    canvas.style.width=`${1000}px`;
    canvas.style.height=`${500}px`;
    
    const ctx=canvas.getContext('2d');
    ctx.scale(ratio,ratio);
    ctx.strokeStyle = 'black';
    ctx.lineWidth=5;
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
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX,offsetY);
  }
  function finishDrawing(e){
    ctxRef.current.closePath();
    isDrawingRef.current=false;
  }
  function draw(e){
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
      <section>
        <div>
          <canvas onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} ref={canvasRef}></canvas>
          <button onClick={clearDrawing} className='bg-amber-200 rounded-lg shadow-xs hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300'> Clear </button>
          <div><input type="text" onChange={handleChange} value={mess}/></div>
          <div><button onClick={handleClick} className='bg-amber-200 rounded-lg shadow-xs hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300'>Click Me</button></div>
          <div>{value}</div>
        </div>
      </section>
    </>
  )
}

export default App
