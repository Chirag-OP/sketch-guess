import { memo } from "react";
import React from "react";
import pencil_sym from '../assets/pencil-line.svg'
function PlayerCard({name,score,isHost,isDrawing}){
    return(
        <>
            <div className={`flex gap-2 p-2 text-gray-200 rounded-lg border border-solid border-gray-300 justify-between`}>
                <div>
                    <span>{name}</span>
                    {isHost && (
                        <span className="text-xs bg-violet-600 text-white px-2 rounded ml-1">
                            HOST
                        </span>
                    )}
                    <div>{score}</div>
                </div>
                {isDrawing ? <div className="invert"><img src={pencil_sym} alt="" /></div> : <div></div>}
            </div>
        </>
    )
}
export default React.memo(PlayerCard);