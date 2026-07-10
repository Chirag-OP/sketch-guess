import { memo } from "react";
import React from "react";
function Results({gameState,playerList,round}){
    return(
    <>
        {gameState === "Show Results" && (
        <div className="flex flex-col items-center justify-center h-full w-full mt-6">
            <h2 className="font-['Press_Start_2P'] text-violet-300 tracking-wider text-xl mb-8">
            ROUND RESULTS
            </h2>

            <div className="w-[70%] flex flex-col items-center gap-3">
                {[...playerList.entries()]
                .sort((a, b) => b[1].currTurnScore - a[1].currTurnScore)
                .map(([id, player], idx) => (
                <div key={id} className="w-[65%] max-w-xl flex items-center justify-between px-5 py-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-4">
                    <span className="text-gray-400 w-6">
                        #{idx + 1}
                    </span>
                    <span className="text-white font-medium">
                        {player.userName}
                    </span>
                    {player.isDrawing && (
                        <span className="text-xs px-2 py-1 rounded bg-orange-500 text-black">
                        DRAWER
                        </span>
                    )}
                    </div>
                    <span className={`font-semibold text-lg ${
                        player.currTurnScore > 0
                        ? "text-green-400"
                        : player.currTurnScore < 0
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                    >
                    {player.currTurnScore > 0 ? "+" : ""}
                    {player.currTurnScore}
                    </span>
                </div>
                ))}
            </div>
        </div>
        )}
        {gameState === "Round End" && (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="font-['Press_Start_2P'] text-violet-300 text-2xl tracking-wider">
                ROUNDS LEFT
                </div>

                <div className="mt-6 text-6xl font-bold text-white">
                {round}
                </div>
            </div>
        )}
    </>
)}
export default React.memo(Results);