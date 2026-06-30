export interface User{
_id:string,
username:string,
email:string,
fullName:string,
avatar:string,
bio:string,
role:"user"|"admin",
isVerified:boolean,
isBanned:boolean,
createdAt:string
}

export interface Post {
  _id: string
  title: string
  body: string
  slug: string
  coverImage: string
  videoUrl: string
  author: User
  category: string
  tags: string[]
  status: "published" | "scheduled"
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  body: string
  post: string
  author: User
  parent: string | null
  replyingTo?: User
  replies?: Comment[]
  createdAt: string
}


export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}