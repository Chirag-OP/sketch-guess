function PlayerCard({name,score,isHost,isDrawing}){
    return(
        <>
            <div className="flex gap-2 p-2 text-gray-200 rounded-lg border border-gray-300">
                <div>A</div>
                <div>
                    <div>{name}</div>
                    <div>{score}</div>
                </div>
                {isHost && <div>host</div>}
            </div>
        </>
    )
}
export default PlayerCard;