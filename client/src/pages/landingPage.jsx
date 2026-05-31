import { Link } from "react-router-dom";
function LandingPage(){
    return(
        <div className=" flex flex-col h-screen">
            <div className="bg-[#1a1a2e] flex text-3xl p-4 border-b border-violet-600 font-['Press_Start_2P'] text-orange-500"><div className="text-violet-600">Sketch</div>Guess</div>
            <div className="w-full h-full flex flex-col items-center justify-center m-4 mb-8">
                <div className="font-['Press_Start_2P'] text-gray-300 text-2xl p-2 mt-4">Draw.    Guess.</div>
                <div className="font-['Press_Start_2P'] text-orange-500 text-2xl p-2">Win.</div>
                <div className="text-gray-400 items-center flex flex-col pb-4"><p>Join a room, pick up your brush, and race to guess what your friends</p><p> are drawing — all in real time.</p></div>
                <div className="flex flex-col gap-2">
                    <div>
                        <div className="text-gray-400 text-xs">YOUR NAME *</div>
                        <input type="text" id='name' className="bg-gray-600 rounded-lg" placeholder="Enter Your Name"/>
                    </div>
                    <div><input type="text" id='joinCode' className="bg-gray-600 rounded-lg" placeholder="Enter Room Code"/></div>
                    <div><button className="border border-white rounded-xl text-white">Create Room</button> <Link to='/canvas'><button className="border border-white rounded-xl text-white">Join Room</button></Link></div>
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