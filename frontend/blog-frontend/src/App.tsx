import {createBrowserRouter,RouterProvider} from "react-router-dom"
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Home from './pages/Home.tsx'
import Post from "./pages/Post.tsx"
import CreatePost from './pages/CreatePost.tsx'
import Profile from "./pages/Profile.tsx"
import Dashboard from "./pages/Dashboard.tsx"

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/post/:slug", element: <Post /> },
  { path: "/create", element: <CreatePost /> },
  { path: "/edit/:postId", element: <CreatePost /> },
  { path: "/profile/:username", element: <Profile /> },
  { path: "/dashboard", element: <Dashboard /> }, 
])

export default function App() {
  return <RouterProvider router={router} />
}