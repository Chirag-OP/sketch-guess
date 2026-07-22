import { useNavigate, useLocation} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { io } from "socket.io-client";

// add password on join or host recieves request so he can accept or reject

function LandingPage(){
    const [createRoom,setCreateRoom]=useState(false);
    const [players, setPlayers] = useState(5);
    const [drawTime, setDrawTime] = useState(60);
    const [rounds,setRounds] = useState(3);
    const [userName,setUserName]=useState('');
    const [joinCode, setJoinCode] = useState('');

    const navigate=useNavigate();
    const location= useLocation();

    const joiningRef= useRef(false);
    const socketRef = useRef(null);
    const gameState = 'Not Started';

    function handleRoomCreate(){
        if(joiningRef.current) return;
        if(userName.length===0){
            alert('Invalid Username');
            return;
        }
        joiningRef.current = true;
        let roomID;
        roomID = nanoid(8);
        roomID = roomID.toUpperCase();
        const playerID = crypto.randomUUID();
        socketRef.current.emit('create_room',{playerID,roomID,userName,
            isHost: true,
            isDrawing: false,
            score:0 ,
            hasGuessed:false,
            joinTime:Date.now()
        });
        sessionStorage.setItem(roomID,playerID);
        socketRef.current.emit('round_info', ({roomID,rounds,drawTime,players,gameState}));
        setTimeout(() => {
            console.log('Creating...');
            navigate(`/canvas/${roomID}`);
            joiningRef.current = false;
        }, 1000);
    }
    function handleJoinRoom(){
        if(joiningRef.current) return;
        const p = sessionStorage.getItem(joinCode);
        if(p) return;
        if(userName.length==0){
            alert('Invalid Username');
            return;
        }
        if(joinCode.length!==8){
            alert('Invalid Room Code');
            return;
        }
        joiningRef.current = true;
        socketRef.current.once('add_player',(arg)=>{
            clearTimeout(timeout);
            if(arg==="success"){
                sessionStorage.setItem(joinCode,playerID);
                setTimeout(() => {
                    console.log('Joining...');
                    navigate(`/canvas/${joinCode}`);
                }, 500);
            }
            else alert(arg);
            joiningRef.current = false;
        })
        const playerID = crypto.randomUUID();
        socketRef.current.emit('add_player',{playerID,roomID:joinCode,userName,
            isHost: false,
            isDrawing: false,
            score:0 ,
            hasGuessed:false,
            joinTime:Date.now()
        });
        const timeout = setTimeout(() => {
            socketRef.current.off("add_player");
            joiningRef.current = false;
            alert("Server did not respond.");
        }, 5000);
    }
    useEffect(() => {
    socketRef.current = io('http://localhost:3000');
    return () => {
        socketRef.current.disconnect();
    };
}, []);
    useEffect(()=>{
        console.log(location.state);
        if(location.state?.roomID){
            console.log(location.state?.roomID)
            setJoinCode(location.state.roomID);
        }
    },[location.state])
    return(
        <div className=" flex flex-col min-h-screen ">
            <div className="bg-[#1a1a2e] flex text-3xl p-4 border-b border-violet-600 font-['Press_Start_2P'] text-orange-500"><div className="text-violet-600">Sketch</div>Guess</div>
            <div className="w-full h-full flex flex-col items-center justify-center m-4 mb-8">
                <div className="font-['Press_Start_2P'] text-gray-300 text-2xl p-2 mt-4">Draw.    Guess.</div>
                <div className="font-['Press_Start_2P'] text-orange-500 text-2xl p-2">Win.</div>
                <div className="text-gray-400 items-center flex flex-col pb-4"><p>Join a room, pick up your brush, and race to guess what your friends</p><p> are drawing — all in real time.</p></div>
                <div className="flex flex-col gap-2 m-4 p-4 w-xl items-center">
                    <div className="p-1 ">
                        <div className="text-gray-400 text-xs">YOUR NAME *</div>
                        <input type="text" id='name' className="bg-gray-600 w-56 rounded-lg text-gray-200" placeholder="Enter Your Name" onChange={(e)=>setUserName(e.target.value)}/>
                    </div>
                    {!createRoom && <div className="mb-1">
                        <div className="text-gray-400 text-xs">JOIN CODE *</div>
                        <input type="text" id='joinCode' className="bg-gray-600 rounded-lg w-56 text-gray-200" placeholder="Enter Room Code" value={joinCode} onChange={(e)=>setJoinCode(e.target.value)}/>
                        </div>}
                    {createRoom && (
                        <div className="flex flex-col gap-2">
                            <div>
                                <div className="text-gray-400 text-xs">PLAYERS *</div>
                                <select value={players} onChange={(e)=>setPlayers(Number(e.target.value))} className="bg-gray-600 rounded-lg w-56 text-gray-200">
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
                            <select value={drawTime} onChange={(e)=>setDrawTime(Number(e.target.value))} className="bg-gray-600 rounded-lg w-56 text-gray-200">
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
                            <select value={rounds} onChange={(e)=>setRounds(Number(e.target.value))} className="bg-gray-600 rounded-lg w-56 text-gray-200">
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
                    <div className="p-1 flex gap-2 w-56"><button className="border border-white rounded-lg text-white flex-1" onClick={()=>{setCreateRoom(prev=>!prev)}}>Create Room</button>{createRoom ? <button className="border border-white rounded-lg text-white w-full flex-1" onClick={handleRoomCreate}>Create</button> 
                        : <button className="flex-1 border border-white rounded-lg text-white w-full" onClick={handleJoinRoom}>Join Room</button>
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