import { useState } from "react";
import { useEffect } from "react";
import { memo } from "react";
import React from "react";
function WordChoiceEle({wordsToChoose,socket}){
    const [clicked,setClicked] = useState(false);
    function handleClick(e){
        if(clicked) return;
        setClicked(true);
        socket.emit('word_choice',e.target.value);
    }
    console.log(wordsToChoose);
    return(
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 w-full">
                <button className="flex-1 border border-white rounded-lg text-white p-2 hover:scale-105 hover:cursor-pointer focus:outline-2 focus:outline-violet-500" value={wordsToChoose[0]} onClick={handleClick}>{wordsToChoose[0]}</button>
                <button className="flex-1 border border-white rounded-lg text-white p-2 hover:scale-105 hover:cursor-pointer focus:outline-2 focus:outline-violet-500" value={wordsToChoose[1]}  onClick={handleClick}>{wordsToChoose[1]}</button>
            </div>
            <div className="w-full flex flex-col items-center">
                <button className="flex-1 border border-white rounded-lg text-white w-full p-2 hover:scale-105 hover:cursor-pointer focus:outline-2 focus:outline-violet-500" value={wordsToChoose[2]} onClick={handleClick}>{wordsToChoose[2]}</button>
            </div>
        </div>
    )
}
export default React.memo(WordChoiceEle);