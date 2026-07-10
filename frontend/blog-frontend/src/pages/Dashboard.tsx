import { useEffect, useState } from 'react'
import { useNavigate ,Link} from 'react-router-dom'
import Navbar from '../components/Navbar'
import { postAPI,userAPI} from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Post } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks' | 'likes' | 'scheduled'>('posts')
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated&&!isLoading) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate,isLoading])

  // Fetch functions
  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const res = await postAPI.getPostsByUser(user?.username!)
      const published = Array.isArray(res.data.data) ? res.data.data : res.data.data.posts || []
      setMyPosts(published.filter((p: any) => p.status === 'published'))
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to fetch posts')
      setIsLoading(false)
    }
  }

  const fetchScheduledPosts = async () => {
    try {
      setIsLoading(true)
      const res = await postAPI.getPostsByUser(user?.username!)
      const scheduled = Array.isArray(res.data.data) ? res.data.data : res.data.data.posts || []
      setScheduledPosts(scheduled.filter((p: any) => p.status === 'scheduled'))
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to fetch scheduled posts')
      setIsLoading(false)
    }
  }

  const fetchBookmarks = async () => {
  try {
    setIsLoading(true)
    const res = await userAPI.getUserBookmarks()
    console.log('Bookmarks response:', res.data.data)
    
    const bookmarkData = res.data.data.bookmarks || []
    
    const validBookmarks = bookmarkData.filter((b: any) => b.post)
    
    const freshPosts = await Promise.all(
      validBookmarks.map((bookmark: any) => postAPI.getPost(bookmark.post.slug))
    )
    setBookmarkedPosts(freshPosts.map(p => p.data.data))
    setIsLoading(false)
  } catch (err) {
    console.error('Failed to fetch bookmarks')
    setIsLoading(false)
  }
}

  const fetchLikes = async () => {
  try {
    setIsLoading(true)
    const res = await userAPI.getUserLikes()
    
    const likeData = res.data.data.likes || []
    
    
    const validLikes = likeData.filter((l: any) => l.post)
    
    const freshPosts = await Promise.all(
      validLikes.map((like: any) => postAPI.getPost(like.post.slug))
    )
    setLikedPosts(freshPosts.map(p => p.data.data))
    setIsLoading(false)
  } catch (err) {
    console.error('Failed to fetch likes')
    setIsLoading(false)
  }
}
 
 // On initial mount, fetch likes count
useEffect(() => {
  const fetchInitialCounts = async () => {
    try {
      const res = await postAPI.getPostsByUser(user?.username!)
      const allPosts = Array.isArray(res.data.data) ? res.data.data : res.data.data.posts || []
      
      const likeData = await userAPI.getUserLikes()
      // ← Filter out null posts
      const validLikes = (likeData.data.data.likes || []).filter((like: any) => like.post)
      setLikedPosts(validLikes.map((like: any) => like.post) || [])

      const bookmarksRes = await userAPI.getUserBookmarks()
      // ← Filter out null posts
      const validBookmarks = (bookmarksRes.data.data.bookmarks || []).filter((b: any) => b.post)
      setBookmarkedPosts(validBookmarks.map((bookmark: any) => bookmark.post) || [])
      
      setScheduledPosts(allPosts.filter((p: any) => p.status === 'scheduled'))
    } catch (err) {
      console.error('Failed to fetch initial counts')
    }
  }

  if (user?.username) {
    fetchInitialCounts()
  }
}, [user?.username])

  // On tab change
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts()
    } else if (activeTab === 'scheduled') {
      fetchScheduledPosts()
    } else if (activeTab === 'bookmarks') {
      fetchBookmarks()
    } else if (activeTab === 'likes') {
      fetchLikes()
    }
  }, [activeTab, user?.username])

  // On window focus
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'likes') {
        fetchLikes()
      } else if (activeTab === 'bookmarks') {
        fetchBookmarks()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [activeTab])

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await postAPI.deletePost(postId)
      setMyPosts(myPosts.filter(p => p._id !== postId))
      setScheduledPosts(scheduledPosts.filter(p => p._id !== postId))
    } catch (err) {
      console.error('Failed to delete post')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  const posts = activeTab === 'posts' ? myPosts : activeTab === 'scheduled' ? scheduledPosts : activeTab === 'bookmarks' ? bookmarkedPosts : likedPosts

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Posts ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'scheduled'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Scheduled ({scheduledPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'bookmarks'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Bookmarks ({bookmarkedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'likes'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Likes ({likedPosts.length})
          </button>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">
              {activeTab === 'posts' && "You haven't created any posts yet"}
              {activeTab === 'scheduled' && "You haven't scheduled any posts"}
              {activeTab === 'bookmarks' && "You haven't bookmarked any posts"}
              {activeTab === 'likes' && "You haven't liked any posts"}
            </p>
            {activeTab === 'posts' && (
              <Link to="/create" className="text-red-600 hover:text-red-700 font-medium">
                Create your first post →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-red-600"
              >
                <div className="flex justify-between items-start gap-4">
                  <Link
                    to={`/post/${post.slug}`}
                    className="flex-1"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                     {post.body?.replace(/<[^>]*>/g, '') || 'No content'}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                      <p>❤️ {post.likes?.length || 0} likes</p>
                    </div>
                  </Link>

                  {/* Delete button (only for My Posts and Scheduled tabs) */}
                  {(activeTab === 'posts' || activeTab === 'scheduled') && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 font-medium whitespace-nowrap"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}   