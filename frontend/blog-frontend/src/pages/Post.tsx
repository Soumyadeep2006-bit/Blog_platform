import { useEffect,useState } from "react"
import { useParams, Link } from 'react-router-dom'
import Navbar from "../components/Navbar.tsx"
import { postAPI, commentAPI, likeAPI, bookmarkAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Post as PostType, Comment } from '../types'
import CommentThread from "../components/CommentThread.tsx"


function Post() {
const {slug} =useParams<{slug:string}>()
const {user,isAuthenticated}=useAuth()
const [post, setPost] = useState<PostType | null>(null)
const [comments, setComments] = useState<Comment[]>([])
const [isLoadingPost, setIsLoadingPost] = useState(true)
const [isLoadingComments, setIsLoadingComments] = useState(false)
const [error, setError] = useState<string | null>(null)
const [commentBody, setCommentBody] = useState('')
const [isSubmittingComment, setIsSubmittingComment] = useState(false)
const [isLiked, setIsLiked] = useState(false)
const [isBookmarked, setIsBookmarked] = useState(false)

useEffect(()=>{
  const fetchPost=async()=>{
try{
  setIsLoadingPost(true)
  const response =await postAPI.getPost(slug!)
  setPost(response.data.data)
  setError(null)
}catch(err:any){
  setError(err.response?.data?.message||"failed to load post")
}finally{
  setIsLoadingPost(false)
}
  }

if(slug) fetchPost()
},[slug])


useEffect(()=>{
  const fetchComments=async()=>{
    if(!post?._id) return //don't fetch if no comments yet 
    try{
      setIsLoadingComments(true)
      const response =await commentAPI.getCommentsByPost(post._id,1,50)
      setComments(response.data.data.comments||[])
    } catch(err){
      console.log("Failed to load comments")
    }finally{
      setIsLoadingComments(false)
    }
  }
  fetchComments()
},[post?._id])


const handleAddComment=async(e:React.SyntheticEvent<HTMLFormElement>)=>{
e.preventDefault()
if(!commentBody.trim()||!post?._id) return

try{
  setIsSubmittingComment(true)
  await commentAPI.addComment(post._id,{body:commentBody})
  setCommentBody("")//clear Input

  //refreshComments List
  const response=await commentAPI.getCommentsByPost(post._id,1,50)
  setComments(response.data.data.comments||[])
}catch(err){
  console.log("Failed to add comment ")

}finally{
  setIsSubmittingComment(false)
}
}

const handleToggleLike = async () => {
  if (!post?._id) return
  try {
    await likeAPI.toggleLike(post._id)
    setIsLiked(!isLiked)  // flip the boolean
  } catch (err) {
    console.error('Failed to toggle like')
  }
}

const handleToggleBookmark = async () => {
  if (!post?._id) return
  try {
    await bookmarkAPI.toggleBookmark(post._id)
    setIsBookmarked(!isBookmarked)  // flip the boolean
  } catch (err) {
    console.error('Failed to toggle bookmark')
  }
}


if (isLoadingPost) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    </div>
  )
}

if (error || !post) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Post not found'}</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}



  
   return (
  <div className="min-h-screen bg-gray-50">
      <Navbar />
      <article className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Post Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <img
            src={post.author.avatar || 'https://placehold.co/600x400/grey/white?text=no+image'}
            alt={post.author.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <Link 
              to={`/profile/${post.author.username}`}
              className="font-semibold text-gray-900 hover:text-red-600"
            >
              {post.author.fullName}
              {post.author.isVerified && <span className="text-blue-600 ml-1">✓</span>}
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Like/Bookmark Buttons */}
        {isAuthenticated && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleToggleLike}
              className={`px-4 py-2 rounded font-medium transition ${
                isLiked 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isLiked ? '❤️ Liked' : '🤍 Like'}
            </button>
            <button
              onClick={handleToggleBookmark}
              className={`px-4 py-2 rounded font-medium transition ${
                isBookmarked 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
            </button>
          </div>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        {/* Post Content */}
        <div 
          className="prose prose-lg max-w-none mb-8 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.body }} 
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-gray-200">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments</h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="mb-8 bg-white p-6 rounded-lg shadow">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentBody.trim()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">
                <Link to="/login" className="text-red-600 font-semibold hover:underline">
                  Sign in
                </Link>
                {' '}to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
{isLoadingComments ? (
  <div className="text-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
  </div>
) : comments.length === 0 ? (
  <p className="text-center text-gray-600 py-8">No comments yet. Be the first!</p>
) : (
  <div className="space-y-4">
    {comments.map((comment) => (
      <CommentThread 
        key={comment._id} 
        comment={comment} 
        postId={post._id}
        onReplyAdded={() => {
          const refetch = async () => {
            const response = await commentAPI.getCommentsByPost(post._id, 1, 50)
            setComments(response.data.data.comments || [])
          }
          refetch()
        }}
      />
    ))}
  </div>
)}
  
    </div>
      </article>
    </div>
  )
}




export default Post