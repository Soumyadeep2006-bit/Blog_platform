import axios ,{AxiosInstance} from "axios"
import {User,Post,Comment,ApiResponse} from "../types"

const API_BASE_URL="http://localhost:8000/api/v1"

const apiClient:AxiosInstance=axios.create({
baseURL:API_BASE_URL,
withCredentials:true  //send cookies with requests 
}
)

//auth endpoints 
export  const authAPI={
    register:(data:{username: string; email: string; fullName: string; password: string })=>
        apiClient.post<ApiResponse<User>>("/auth/register",data),

    login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<User>>("/auth/login", data),

     logout: () => apiClient.post("/auth/logout"),
              
    refreshToken:()=>apiClient.post("/auth/refresh-token")

    }


//post endpoints
export const postAPI={
      getAllPosts: (page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<{ posts: Post[]; pagination: any }>>(
      `/posts/all?page=${page}&limit=${limit}`
    ),

    getPost:(slug:string)=>apiClient.get<ApiResponse<Post>>(`/posts/${slug}`),

    getPostsByUser: (username: string, page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<any>>(`/posts/user/${username}?page=${page}&limit=${limit}`),

     createPost: (data: FormData) =>
    apiClient.post<ApiResponse<Post>>("/posts/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

    updatePost:(postId:string,data:FormData)=>
      apiClient.put<ApiResponse<Post>>(`/posts/${postId}`,data,{headers:{
        "Content-Type":"multipart/form-data"
      }}),

     deletePost: (postId: string) =>
    apiClient.delete(`/posts/${postId}`),

}    

 //comment endpoints
   export const commentAPI = {
  addComment: (postId: string, data: { body: string }) =>
    apiClient.post<ApiResponse<Comment>>(`/comments/${postId}/add-comment`, data),

  getComments: (postId: string, page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<any>>(`/comments/${postId}/comments?page=${page}&limit=${limit}`),

  deleteComment: (commentId: string) =>
    apiClient.delete(`/comments/${commentId}`),
}


//user endpoints
export const userAPI = {
  getCurrentUser: () =>
    apiClient.get<ApiResponse<User>>("/users/me"),

  getUserProfile: (username: string) =>
    apiClient.get<ApiResponse<User>>(`/users/profile/${username}`),

  getUserLikes: (page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<any>>(`/users/my-likes?page=${page}&limit=${limit}`),

  getUserBookmarks: (page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<any>>(`/users/my-bookmarks?page=${page}&limit=${limit}`),

  updateAccountDetails: (data: { fullName?: string; email?: string }) =>
    apiClient.put<ApiResponse<User>>("/users/update", data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient.put("/users/change-password", data),

  updateAvatar:(data:FormData)=>
    apiClient.put<ApiResponse<User>>("/users/avatar",data ,{
      headers:{"Content-Type":"multipart/form-data"}
    }),

  getUserFollowers: (username: string, page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<any>>(`/users/${username}/followers?page=${page}&limit=${limit}`),

  getUserFollowing: (username: string, page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<any>>(`/users/${username}/following?page=${page}&limit=${limit}`),
}


//like and bookmark endpoints 
export const likeAPI = {
  toggleLike: (postId: string) =>
    apiClient.post(`/likes/${postId}/toggle`),

  getUserLikes: (page: number = 1) =>
    apiClient.get(`/users/my-likes?page=${page}`),
}

export const bookmarkAPI = {
  toggleBookmark: (postId: string) =>
    apiClient.post(`/bookmarks/${postId}/toggle`),
}

//follow endpoints 
export const followAPI = {
  toggleFollow: (userId: string) =>
    apiClient.post(`/follows/${userId}/toggle-follow`),
}

export default apiClient

