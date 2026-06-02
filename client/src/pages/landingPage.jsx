import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

// use useNavigate instead of link to create room first before going to next page
function LandingPage(){
    const [createRoom,setCreateRoom]=useState(false);
    const [players, setPlayers] = useState(5);
    const [drawTime, setDrawTime] = useState(60);
    const [rounds,setRounds] = useState(3);
    return(
        <div className=" flex flex-col min-h-screen">
            <div className="bg-[#1a1a2e] flex text-3xl p-4 border-b border-violet-600 font-['Press_Start_2P'] text-orange-500"><div className="text-violet-600">Sketch</div>Guess</div>
            <div className="w-full h-full flex flex-col items-center justify-center m-4 mb-8">
                <div className="font-['Press_Start_2P'] text-gray-300 text-2xl p-2 mt-4">Draw.    Guess.</div>
                <div className="font-['Press_Start_2P'] text-orange-500 text-2xl p-2">Win.</div>
                <div className="text-gray-400 items-center flex flex-col pb-4"><p>Join a room, pick up your brush, and race to guess what your friends</p><p> are drawing — all in real time.</p></div>
                <div className="flex flex-col gap-2 m-4 p-4 w-xl items-center">
                    <div className="p-1 ">
                        <div className="text-gray-400 text-xs">YOUR NAME *</div>
                        <input type="text" id='name' className="bg-gray-600 w-56 rounded-lg text-gray-200" placeholder="Enter Your Name"/>
                    </div>
                    {!createRoom && <div className="p-1"><input type="text" id='joinCode' className="bg-gray-600 rounded-lg w-56 text-gray-200" placeholder="Enter Room Code"/></div>}
                    {createRoom && (
                        <div className="flex flex-col gap-2">
                            <div>
                                <div className="text-gray-400 text-xs">PLAYERS *</div>
                                <select value={players} onChange={(e)=>setPlayers(e.target.value)} className="bg-gray-600 rounded-lg w-56 text-gray-200">
                                <option value="2">2 Players</option>
                                <option value="3">3 Players</option>
                                <option value="4">4 Players</option>
                                <option value="5">5 Players</option>
                                <option value="6">6 Players</option>
                                <option value="7">7 Players</option>
                                <option value="8">8 Players</option>
                                <option value="9">9 Players</option>
                                <option value="10">10 Players</option>
                            </select>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs">DRAW TIME *</div>
                            <select value={drawTime} onChange={(e)=>setDrawTime(e.target.value)} className="bg-gray-600 rounded-lg w-56 text-gray-200">
                                <option value="20">20 sec</option>
                                <option value="30">30 sec</option>
                                <option value="40">40 sec</option>
                                <option value="50">50 sec</option>
                                <option value="60">60 sec</option>
                                <option value="70">70 sec</option>
                                <option value="80">80 sec</option>
                                <option value="90">90 sec</option>
                            </select>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs">ROUNDS *</div>
                            <select value={rounds} onChange={(e)=>setRounds(e.target.value)} className="bg-gray-600 rounded-lg w-56 text-gray-200">
                                <option value="1">1 rounds</option>
                                <option value="2">2 rounds</option>
                                <option value="3">3 rounds</option>
                                <option value="4">4 rounds</option>
                                <option value="5">5 rounds</option>
                                <option value="6">6 rounds</option>
                                <option value="7">7 rounds</option>
                                <option value="8">8 rounds</option>
                                <option value="9">9 rounds</option>
                            </select>
                        </div>
                        </div>
                    )}
                    <div className="p-1 flex gap-2 w-56"><button className="border border-white rounded-lg text-white flex-1" onClick={()=>{setCreateRoom(prev=>!prev)}}>Create Room</button>{createRoom ? <Link to='/canvas' className="flex-1"><button className="border border-white rounded-lg text-white w-full">Create</button></Link> 
                        : <Link to='/canvas' className="flex-1"><button className="border border-white rounded-lg text-white w-full">Join Room</button></Link>
                    }</div>
                </div>
            </div>
            <div className="grid grid-cols-23 mt-auto mb-8">
                <div className=" mt-8 border-t border-violet-600 col-span-24"></div>
                <div className="text-gray-400 justify-self-center col-span-24 mt-2">HOW IT WORKS</div>
                <div className=" border border-violet-600 col-start-2 col-span-7 rounded-lg p-4 m-2">
                    <div className="text-gray-100">Create or join</div>
                    <div className="text-gray-400"><p>Start a private room and share the code, or jump into a public one instantly.</p></div>
                </div>
                <div className=" border border-violet-600 col-span-7 rounded-lg p-4 m-2">
                    <div className="text-gray-100">Draw your word</div>
                    <div className="text-gray-400"><p>You get a secret word and 60 seconds. Use the canvas to draw it - no letters!</p></div>
                </div>
                <div className=" border border-violet-600 col-span-7 rounded-lg p-4 m-2">
                    <div className="text-gray-100">Guess and score</div>
                    <div className="text-gray-400"><p>Faster correct guesses earn more points. Most points after all rounds wins</p></div>
                </div>
            </div>
        </div>
    )
}
export default LandingPage;