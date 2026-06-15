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



