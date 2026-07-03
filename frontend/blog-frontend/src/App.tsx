
import {createBrowserRouter,RouterProvider} from "react-router-dom"

import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Home from './pages/Home.tsx'
import Post from "./pages/Post.tsx"
import CreatePost from './pages/CreatePost.tsx'



const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {path:"/post/:slug",element:<Post/>},
  { path: "/create", element: <CreatePost /> },
  { path: "/edit/:postId", element: <CreatePost /> },
])

function App() {
 

  return (
  <RouterProvider router={router}/>
  )
}

export default App
