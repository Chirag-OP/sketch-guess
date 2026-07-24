import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import ToolBar from './toolBox';
import { useLocation, useParams } from 'react-router-dom';

function Canvas({socket,tool,isDrawer,lineWidth,fillColor,strokeColor}){
  const socketRef = useRef(null);
  const xRef=useRef(null);
  const yRef=useRef(null);
  const canvasRef=useRef(null);
  const ctxRef=useRef(null);
  const isDrawingRef=useRef(false);
  const canvasContRef=useRef(null);
  const drawingArr = useRef([]);
  const redrawRef=useRef('');

  const lineWidthRef = useRef(lineWidth);
  const fillColorRef = useRef(fillColor);
  const strokeColorRef = useRef(strokeColor);
  useEffect(() => {
    socketRef.current = socket;
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    ctxRef.current=ctx;

    const redraw=()=>{
      if(!canvasRef.current || !ctxRef.current) return;
      ctx.strokeStyle='black';
      ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
      for(const d of drawingArr.current){
        const type = d.tool;
        const w = d.lineWidth;
        ctx.lineWidth = w;
        if(type==='pencil'){
          ctx.strokeStyle= d.strokeColor;
          ctx.beginPath();
          ctx.moveTo(d.startX, d.startY);
          ctx.lineTo(d.finishX,d.finishY);
          ctx.stroke();
        }
        else if(type==='rectangle'){
          const fillColor = d.fillColor;
          ctx.strokeStyle= d.strokeColor;
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.rect(d.startX,d.startY,d.finishX-d.startX,d.finishY-d.startY);
          if (fillColor && fillColor !== "transparent") ctx.fill();
          ctx.stroke();
        }
        else if(type==='circle'){
          const fillColor = d.fillColor;
          ctx.strokeStyle= d.strokeColor;
          ctx.fillStyle = fillColor;
          const radius=Math.sqrt((d.finishX-d.startX)**2+(d.finishY-d.startY)**2);
          ctx.beginPath();
          ctx.arc(d.startX,d.startY,radius,0,Math.PI*2,true);
          if (fillColor && fillColor !== "transparent") ctx.fill();
          ctx.stroke();
        }
        else if(type==='line'){
          ctx.strokeStyle= d.strokeColor;
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
        }
      }
      ctx.lineWidth = lineWidthRef.current;
      ctx.strokeStyle = strokeColorRef.current;
      ctx.fillStyle = fillColorRef.current;
    }

    socketRef.current.on("drawing",(arg)=>{
      drawingArr.current=arg;
      redraw();
    })
    socketRef.current.emit('req_drawing',"");

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
      ctx.lineWidth = lineWidthRef.current;
      ctx.strokeStyle=strokeColorRef.current;
      ctx.fillStyle = fillColorRef.current;
      ctx.lineCap = "round";
      redraw();
    }
    resizeCanvas();
    const observer=new ResizeObserver(() => {
      resizeCanvas();
    });
    observer.observe(canvasContRef.current);
    ctx.lineCap="round";
    return () => {
    observer.disconnect();
    socketRef.current?.off("drawing");
  }
  }, [])
  useEffect(()=>{
    lineWidthRef.current = lineWidth;
      ctxRef.current.lineWidth=lineWidth;
  },[lineWidth])

  useEffect(()=>{
    strokeColorRef.current = strokeColor;
    fillColorRef.current = fillColor;
    ctxRef.current.strokeStyle = strokeColor;
    ctxRef.current.fillStyle = fillColor;
  },[strokeColor,fillColor])
  useEffect(() => {
  if(tool!=="clear_all") return;
  ctxRef.current?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
        finishY:offsetY,
        lineWidth:lineWidth,
        fillColor:fillColor,
        strokeColor: strokeColor
      });
    }
    else if(tool && tool==='circle'){
      drawingArr.current.push({
        tool:"circle",
        startX:xRef.current,
        startY:yRef.current,
        finishX:offsetX,
        finishY:offsetY,
        lineWidth:lineWidth,
        fillColor:fillColor,
        strokeColor: strokeColor
      });
    }
    else if(tool && tool==='line'){
      drawingArr.current.push({
        tool:"line",
        startX:xRef.current,
        startY:yRef.current,
        finishX:offsetX,
        finishY:offsetY,
        lineWidth:lineWidth,
        strokeColor: strokeColor
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
        finishY:offsetY,
        lineWidth:lineWidth,
        strokeColor: strokeColor
      });
      xRef.current=offsetX;
      yRef.current=offsetY;
    }
    else if(tool==='rectangle'){
      ctxRef.current.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
      redrawRef.current?.();
      if (fillColor !== "transparent") ctxRef.current.fillRect(xRef.current,yRef.current,offsetX - xRef.current,offsetY - yRef.current);
      ctxRef.current.strokeRect(xRef.current, yRef.current, offsetX-xRef.current, offsetY-yRef.current);
    }
    else if(tool==='circle'){
      ctxRef.current.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
      redrawRef.current?.();
      let radius=Math.sqrt((offsetX-xRef.current)**2+(offsetY-yRef.current)**2);
      ctxRef.current.beginPath();
      ctxRef.current.arc(xRef.current,yRef.current,radius,0,Math.PI*2,true);
      if (fillColor !== "transparent") ctxRef.current.fill();
      ctxRef.current.stroke();
    }
    else if(tool==='line'){
        ctxRef.current.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
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
            finishY:offsetY,
            lineWidth:lineWidth
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