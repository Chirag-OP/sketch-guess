import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import './App.css'
import { use } from 'react'

function App() {
  const [value, setValue] = useState('a')
  const [mess, setMess] = useState('');
  const socketRef = useRef(null)
  useEffect(() => {
    fetch('http://localhost:3000/api')
    .then((res)=>{
      return res.text();
    })
    .then((data)=>{
    })
    socketRef.current = io('http://localhost:3000')
    socketRef.current.on("hello",(arg)=>{
      console.log(arg)
    })
    socketRef.current.on("chat",(arg)=>{
      setValue(arg);
    })
    return () => {
    socketRef.current?.disconnect()
  }
  }, [])
  function handleClick(){
    socketRef.current?.emit("chat",mess);
    setValue(null);
    setMess('');
  }
  function handleChange(e){
    setMess(e.target.value)
  }
  return (
    <>
      <section>
        <div><input type="text" onChange={handleChange} value={mess}/></div>
        <div><button onClick={handleClick}>Click Me</button></div>
        <div>{value}</div>
      </section>
    </>
  )
}

export default App
