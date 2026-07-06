import {createContext, useContext,useState,useEffect,ReactNode} from "react"

import {User} from "../types/index.ts"
import {authAPI,userAPI } from "../services/api.ts"

interface AuthContextType{
    user:User|null
    isLoading:boolean
    error:string|null
    isAuthenticated:boolean

    login:(emailorusername:string,password:string)=>Promise<void>
    register: (username: string, email: string, fullName: string, password: string, avatar?: File) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}

//create context , default value undefined
const AuthContext=createContext<AuthContextType|undefined>(undefined)

//PROVIDER COMPONENT THAT WRAPS THE APP
export const AuthProvider=({children}:{children:ReactNode})=>{
    const [user,setUser]=useState<  User|null>(null)
    const [isLoading,setIsLoading]=useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

      useEffect(() => {
    checkAuth()
  }, [])

    const checkAuth=async()=>{
        try{
            setIsLoading(true)
            const response=await userAPI.getCurrentUser()
            setUser(response.data.data)
            setError(null)
        } catch(err){
            setUser(null)
            setError(null)//not an error if not logged in 

        }finally{
            setIsLoading(false)
        }
    }

    const login =async(emailorusername:string,password:string)=>{
        try{
            setIsLoading(true)
            const response=await authAPI.login({email:emailorusername,password})
            const userData = (response.data.data as any).user as User
            setUser(userData)
            setError(null)

        }catch (err:any){
       setError(err.response?.data?.message||"Login falied")
       throw(err)
        }finally{
            setIsLoading(false)
        }

    }

    const register=async(username:string,email:string,fullName:string,password:string,avatar?:File)=>{
        try{
              const formData = new FormData()
              formData.append("username", username)
              formData.append("email", email)
              formData.append("fullName", fullName)
              formData.append("password", password)
    if (avatar) {
      formData.append("avatar", avatar)
    }
            setIsLoading(true)
            const response=await authAPI.register(formData)
            const userData = (response.data.data as any).user as User
    setUser(userData)
            setError(null)
        }catch(err:any){
            setError(err.response?.data?.message||"Registration Failed")
            throw err
        }finally{
            setIsLoading(false)
        }
    }

    const logout = async () => {
    try {
      setIsLoading(true)
      await authAPI.logout()
      setUser(null)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const value:AuthContextType={
     user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>


}

export const useAuth=()=>{
    const context=useContext(AuthContext)
    if(!context)
        throw new Error("useAuth must be used within AuthProvider")
return context 
}

   


