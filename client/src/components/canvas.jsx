import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import ToolBar from './toolBox';
import { useLocation, useParams } from 'react-router-dom';

function Canvas({socket,tool,isDrawer,lineWidth}){
  const socketRef = useRef(null);
  const xRef=useRef(null);
  const yRef=useRef(null);
  const canvasRef=useRef(null);
  const ctxRef=useRef(null);
  const isDrawingRef=useRef(false);
  const canvasContRef=useRef(null);
  const drawingArr = useRef([]);
  const redrawRef=useRef('');
  useEffect(() => {
    socketRef.current = socket;
    const canvas=canvasRef.current;
    const ctx=canvas.getContext('2d');
    socketRef.current.on("drawing",(arg)=>{
      drawingArr.current=arg;
      redraw();
    })
    socketRef.current.emit('req_drawing',"");
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
    const resizeCanvas=()=>{
      if(!canvasContRef.current) return;
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
    ctx.lineWidth=lineWidth;
    ctx.lineCap="round";
    ctxRef.current=ctx;
    return () => {
    observer.disconnect();
  }
  }, [])
  useEffect(() => {
  if(tool!=="clear_all") return;
  ctxRef.current?.clearRect(0, 0, 1000, 500);
  drawingArr.current = [];
  if(isDrawer) {
    socketRef.current?.emit("drawing", []);
  }
}, [tool, isDrawer]);
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
    if(isDrawer) socketRef.current?.emit("drawing",drawingArr.current);
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
    return(
        <div className='' ref={canvasContRef}>
            <canvas className={`bg-white `} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} ref={canvasRef}></canvas>
        </div>
    )
}
export default Canvas;