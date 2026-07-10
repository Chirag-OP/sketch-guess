import {useEffect, useState } from "react";
import { useParams } from "react-router-dom";
function FinalStandings(){
    const {roomID} = useParams();
    const [playerList, setPlayerList] = useState([]);
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
            console.error(err)
        })
    },[roomID])
    return(
        <>
        <div className="bg-[#1a1a2e] flex text-3xl p-4 border-b border-violet-600 font-['Press_Start_2P'] text-orange-500"><div className="text-violet-600">Sketch</div>Guess</div>
        <div className="flex flex-col items-center mt-10">
            <div className="p-2 m-1 h-full w-[50%]">
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <span className="flex flex-col items-center">
                        <div className="font-['Press_Start_2P'] text-violet-300 text-3xl tracking-wider">
                        GAME OVER
                        </div>
                        <div className="text-gray-200 text-lg font-semibold">
                        Here are the Final Results
                        </div>
                    </span>
                    <section className="flex justify-center items-end gap-4 text-gray-200">
                        <div>
                            <div className="flex justify-center">{playerList[1].userName}</div>
                            <div className="bg-gray-400 h-40 w-30 flex justify-center items-center hover:scale-105">2nd</div>
                        </div>
                        <div>
                            <div className="flex justify-center">{playerList[0].userName}</div>
                            <div className="bg-gray-400 h-50 w-30 flex justify-center items-center hover:scale-105">1st</div>
                        </div>
                        <div>
                            <div className="flex justify-center">{playerList[0].userName}</div>
                            <div className="bg-gray-400 h-30 w-30 flex justify-center items-center hover:scale-105">3rd</div>
                        </div>
                    </section>
                    
                </div>
            </div>
        </div>
        </>
    )
}
export default FinalStandings;