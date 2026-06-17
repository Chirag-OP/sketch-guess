import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client";
import './App.css'
import { use } from 'react'
import {Route,Routes,Link } from 'react-router-dom';
import LandingPage from './pages/landingPage';
import CanvasPage from './pages/canvasPage';
// linewidth slider update krna hai
// undo redo buttons and color options
// for linewidth and color store them in drawing arr
// designing landing page
function App() {
  return (
    <>
    <section className="bg-[#0d0d1a] min-h-screen font-['Exo_2'] ">
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path='/canvas/:roomID' element={<CanvasPage></CanvasPage>}></Route>
    </Routes>
     </section>
    </>
  )
}

export default App
