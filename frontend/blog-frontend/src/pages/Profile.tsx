import { useEffect, useState ,} from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { userAPI, postAPI, followAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { User, Post } from '../types'
import { useNavigate,Link } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const { user: currentUser,isAuthenticated } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

 useEffect(() => {
  if (!username) return 
  const fetchData = async () => {
    try {
      const [userRes, postsRes, followersRes, followingRes] = await Promise.all([
        userAPI.getUserProfile(username!),
        postAPI.getPostsByUser(username!),
        userAPI.getUserFollowers(username!, 1, 10),
        userAPI.getUserFollowing(username!, 1, 10),
      ])

      const profileUser = userRes.data.data
      setUser(profileUser)
      
      // Check if current user is in the followers of this profile user
     if (currentUser && followersRes.data.data) {
  const alreadyFollowing = followersRes.data.data.some(
    (follower: any) => follower.followedBy._id === currentUser._id
  )
  setIsFollowing(alreadyFollowing)
}
      
      setPosts(postsRes.data.data.posts || [])
      setFollowers(followersRes.data.data || [])
      setFollowing(followingRes.data.data || [])
      setIsLoading(false)
    } catch (err: any) {
      console.error('Error fetching profile:', err.response?.data || err.message)
      setIsLoading(false)
    }
  }
  fetchData()
}, [username, currentUser])

  useEffect(() => {
  if (!isAuthenticated && !isLoading) {
    navigate('/login')
  }
}, [isAuthenticated, navigate,isLoading])

  const isOwnProfile = currentUser?._id === user?._id

  const handleToggleFollow = async () => {
    try {
      await followAPI.toggleFollow(user?._id!)
      setIsFollowing(!isFollowing)
      
      // Refetch followers after follow
      const followersRes = await userAPI.getUserFollowers(username!, 1, 10)
      setFollowers(followersRes.data.data || [])
      
      // Only refetch own following count if on own profile
      if (isOwnProfile) {
        const followingRes = await userAPI.getUserFollowing(username!, 1, 10)
        setFollowing(followingRes.data.data || [])
      }
    } catch (err) {
      console.error('Failed to toggle follow')
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start gap-6">
            <img
              src={user.avatar || 'https://placehold.co/600x400/grey/white?text=no+image'}
              alt={user.fullName}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.fullName}
                {user.isVerified && <span className="text-blue-600 ml-2">✓</span>}
              </h1>
              <p className="text-gray-600 mb-4">@{user.username}</p>
              <p className="text-gray-700 mb-6">{user.bio || 'No bio yet'}</p>

              {/* Stats */}
             
<div className="flex gap-8 mb-6">
  <div className="text-center">
    <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
    <p className="text-gray-600">Posts</p>
  </div>
  <Link to={`/profile/${user.username}/followers`} className="text-center hover:text-red-600 transition">
    <p className="text-2xl font-bold text-gray-900">{followers.length}</p>
    <p className="text-gray-600">Followers</p>
  </Link>
  <Link to={`/profile/${user.username}/following`} className="text-center hover:text-red-600 transition">
    <p className="text-2xl font-bold text-gray-900">{following.length}</p>
    <p className="text-gray-600">Following</p>
  </Link>
</div>

              {/* Follow Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleToggleFollow}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No posts yet</p>
          ) : (
            <div className="grid gap-6">
           {posts.map((post, index) => (
  <Link
    key={index}
    to={`/post/${post.slug}`}
    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-red-600"
  >
    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
    <p className="text-gray-600 mb-4 line-clamp-2">
      {post.body.replace(/<[^>]*>/g, '')}
    </p>
    <div className="flex justify-between items-center text-sm text-gray-500">
      <p>{new Date(post.createdAt).toLocaleDateString()}</p>
      <p>❤️ {post.likes?.length || 0} likes</p>
    </div>
  </Link>
))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}