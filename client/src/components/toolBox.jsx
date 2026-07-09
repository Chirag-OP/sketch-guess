import { useState, useEffect, useRef } from 'react'
import pencil_sym from '../assets/pencil-line.svg'
import erase_sym from '../assets/eraser.svg'
import trash_sym from '../assets/trash.svg'
import sqare_sym from '../assets/square.svg'
import circle_sym from '../assets/circle.svg'
import line_sym from '../assets/minus.svg'

function ToolBar({setTool,lineWidth}){
    function handleChange(e){
        lineWidth=e.target.value;
    }
    return(
    <div className={`flex gap-2 m-2 p-4 rounded-xl bg-[#1e1a3a] absolute left-1/2 -translate-x-1/2 bottom-2 border border-violet-600`}>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('pencil')}}><img src={pencil_sym}></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('rectangle')}}><img src={sqare_sym}></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('circle')}}><img src={circle_sym}></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('line')}}><img src={line_sym} className='rotate-45'></img></button>
        <button className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300' onClick={()=>{setTool('eraser')}}><img src={erase_sym}></img></button>
        <button onClick={()=>{setTool('clear_all')}} className='bg-gray-300 rounded-xs p-1 m-1 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300'><img src={trash_sym}></img></button>
        <input type="range" defaultValue={lineWidth} step={1} min={1} max={10} onChange={handleChange}/>
    </div>
    )
}
export default ToolBar;