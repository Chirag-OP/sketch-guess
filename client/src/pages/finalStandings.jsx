import { Fragment } from "react";
import {useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function FinalStandings(){
    const {roomID} = useParams();
    const [playerList, setPlayerList] = useState([]);
    const navigate = useNavigate();
    const [leaving,setLeaving]=useState(false);
    function handlePlayAgain(){
        return;
    }
    function handleRoomLeave(){
        // if(leaving) return;
        // setLeaving(true);
        // fetch(`/del_room/${roomID}`)
        // .then((response)=>{
        //     if(!response.ok) throw new Error('Something Failed')
        // }).catch((err)=>{
        //     console.error(err);
        // }).finally(()=>{
        //     navigate('/')
        // })
        navigate('/');
    }
    useEffect(()=>{
        fetch(`/final_results/${roomID}`)
        .then((response)=>{
            return response.json().then((data)=>{
                if(!response.ok){
                throw new Error(data.error || 'Request Failed');
                }
                return data;
            })
        }).then((data)=>{
            setPlayerList(data);
        }).catch((err)=>{
            if(err.status===404) navigate('/');
            console.error(err)
        })
    },[roomID])
    return(
        <>
        <div className="bg-[#1a1a2e] flex text-3xl p-4 border-b border-violet-600 font-['Press_Start_2P'] text-orange-500"><div className="text-violet-600">Sketch</div>Guess</div>
        <div className="flex flex-col items-center mt-4">
            <div className="p-2 m-1 h-full w-[50%]">
                <div className="flex flex-col items-center justify-center h-full gap-8">
                    <span className="flex flex-col items-center">
                        <div className="font-['Press_Start_2P'] text-violet-300 text-3xl tracking-wider">
                        GAME OVER
                        </div>
                        <div className="text-gray-200 text-lg font-semibold">
                        Here are the Final Results
                        </div>
                    </span>
                    {playerList.length>=2 && (<section className="w-full"> <div className="flex justify-center items-end gap-4 text-gray-200 font-['Press_Start_2P']">
                        <div>
                            <div className="flex justify-center">{playerList[1].userName}</div>
                            <div className="flex justify-center">{playerList[1].score} pts</div>
                            <div className="bg-slate-400 h-40 w-30 flex justify-center items-center hover:scale-105 rounded-t-lg">2nd</div>
                        </div>
                        <div>
                            <div className="flex justify-center">{playerList[0].userName}</div>
                            <div className="flex justify-center">{playerList[0].score} pts</div>
                            <div className="bg-yellow-500 h-50 w-30 flex justify-center items-center hover:scale-105 rounded-t-lg">1st</div>
                        </div>
                        {playerList.length>=3 && <div>
                            <div className="flex justify-center">{playerList[2].userName}</div>
                            <div className="flex justify-center">{playerList[2].score} pts</div>
                            <div className="bg-orange-700 h-30 w-30 flex justify-center items-center hover:scale-105 rounded-t-lg">3rd</div>
                        </div>}
                    </div>
                    <div className="flex justify-center"><hr className="border-t-8 border-zinc-700 w-[80%] rounded-t-md"/></div>
                    </section>
                    )}
                    <section className="border border-violet-400 p-4 m-1 text-gray-200 w-full rounded-2xl mt-8">
                        <div className="flex gap-4 w-full justify-between p-2 text-violet-400 font-['Press_Start_2P']">
                            <div className="flex-1">Rank</div>
                            <div className="flex-4">Player</div>
                            <div className="flex-1 flex justify-end">Score</div>
                        </div>
                        <hr className="border-t border-dashed border-violet-400" />
                        {playerList.map((player,id)=>(
                            <Fragment key={id}>
                            <div className="flex gap-4 w-full justify-between p-2 font-['Press_Start_2P']">
                                <div className="flex-1">{id+1}</div>
                                <div className="flex-4">{player.userName}</div>
                                <div className="flex-1 flex justify-end">{player.score} pts</div>
                            </div>
                            {id!==playerList.length-1 && <hr className="border border-gray-900" />}
                            </Fragment>
                        ))}
                    </section>

                    <section>
                        <div className="flex gap-2 font-['Press_Start_2P']">
                            <button className="flex-1 border border-white rounded-lg text-white w-full p-4 m-1 bg-violet-900 hover:scale-105 
                            hover:border-violet-900 hover:cursor-pointer" onClick={handlePlayAgain}>Play Again</button>
                            <button className="flex-1 border border-white rounded-lg text-white w-full p-4 m-1 bg-red-900 hover:scale-105
                             hover:border-red-900 hover:cursor-pointer" onClick={handleRoomLeave}>Leave Room</button>
                        </div>
                    </section>
                    
                </div>
            </div>
        </div>
        </>
    )
}
export default FinalStandings;