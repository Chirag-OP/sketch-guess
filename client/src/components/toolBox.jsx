import { useState, useEffect, useRef } from 'react'
import pencil_sym from '../assets/pencil-line.svg'
import erase_sym from '../assets/eraser.svg'
import trash_sym from '../assets/trash.svg'
import sqare_sym from '../assets/square.svg'
import circle_sym from '../assets/circle.svg'
import line_sym from '../assets/minus.svg'
import fill_sym from '../assets/paint-bucket.svg'

function ToolBar({tool,setTool,lineWidth,setLineWidth,strokeColor, setStrokeColor, fillColor, setFillColor}){
    const [colorStyle , setColorStyle]= useState('stroke');
    function handleColorStyleChange(){
        const supportsFill = tool === "rectangle" || tool === "circle";
        if(!supportsFill) return;
        setColorStyle(prev => prev === "stroke" ? "fill" : "stroke");
    }
    function handleChange(e){
        setLineWidth(Number(e.target.value));
    }
    function handleColorChange(e){
        colorStyle === 'stroke' ? setStrokeColor(e.target.value) : setFillColor(e.target.value);
    }
    useEffect(() => {
        const supportsFill = tool==="rectangle" || tool === "circle";
        if(!supportsFill) {
            setColorStyle("stroke");
        }
    }, [tool]);
    return(
    <div className={`flex gap-2 m-2 p-4 rounded-xl bg-[#1e1a3a] absolute left-1/2 -translate-x-1/2 bottom-2 border border-violet-600`}>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('pencil')}}><img src={pencil_sym}></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('rectangle')}}><img src={sqare_sym}></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('circle')}}><img src={circle_sym}></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('line')}}><img src={line_sym} className='rotate-45'></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('eraser')}}><img src={erase_sym}></img></button>
        <button className={`bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 ${colorStyle === 'fill' ? 'bg-gray-500' : ''}`} onClick={handleColorStyleChange}><img src={fill_sym}></img></button>
        <button onClick={()=>{setTool('clear_all')}} className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300'><img src={trash_sym}></img></button>
        <input type="range" value={lineWidth} step={1} min={1} max={10} onChange={handleChange}/>
        <input type="color" value={ colorStyle === 'stroke' ? strokeColor : fillColor} onChange={handleColorChange}/>
    </div>
    )
}
export default ToolBar;