import { useState } from "react";
function WordChoiceEle({wordsToChoose,socket}){
    const [clicked,setClicked] = useState(false);
    function handleClick(e){
        if(clicked) return;
        setClicked(true);
        socket.emit('word_choice',e.target.value);
    }
    console.log(wordsToChoose);
    return(
        <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-2 w-[50%]">
                <button className="flex-1 border border-white rounded-lg text-white p-2 hover:scale-105" value={wordsToChoose[0]} onClick={handleClick}>{wordsToChoose[0]}</button>
                <button className="flex-1 border border-white rounded-lg text-white p-2 hover:scale-105" value={wordsToChoose[1]}  onClick={handleClick}>{wordsToChoose[1]}</button>
            </div>
            <div className="w-[50%] flex flex-col items-center">
                <button className="flex-1 border border-white rounded-lg text-white w-full p-2 hover:scale-105" value={wordsToChoose[2]} onClick={handleClick}>{wordsToChoose[2]}</button>
            </div>
        </div>
    )
}
export default WordChoiceEle;