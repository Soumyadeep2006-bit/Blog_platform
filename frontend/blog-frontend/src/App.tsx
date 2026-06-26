import { useState } from 'react'
import {createBrowserRouter,RouterProvider} from "react-router-dom"

import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Home from './pages/Home.tsx'

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
])

function App() {
 

  return (
  <RouterProvider router={router}/>
  )
}

export default App
