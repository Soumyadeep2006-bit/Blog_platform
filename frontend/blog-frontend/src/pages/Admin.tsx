import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { userAPI, postAPI,adminAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { User, Post } from '../types'

export default function Admin() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/')
    }
  }, [isAuthenticated, user?.role, navigate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        if (activeTab === 'users') {
          const res = await userAPI.getAllUsers(1, 50)
          setUsers(res.data.data.users || [])
        } else {
          const res = await postAPI.getAllPosts(1, 50)
          setPosts(res.data.data.posts || [])
        }
      } catch (err) {
        console.error('Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [activeTab])

  const handleBanUser = async (userId: string) => {
    if (!confirm('Ban this user?')) return
    try {
      await adminAPI.banUser(userId)
      setUsers(users.map(u => u._id === userId ? { ...u, isBanned: true } : u))
    } catch (err) {
      console.error('Failed to ban user')
    }
  }

  const handleVerifyUser = async (userId: string) => {
    if (!confirm('Verify this user?')) return
    try {
      await adminAPI.verifyUser(userId)
      setUsers(users.map(u => u._id === userId ? { ...u, isVerified: true } : u))
    } catch (err) {
      console.error('Failed to verify user')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await adminAPI.deletePost(postId)
      setPosts(posts.filter(p => p._id !== postId))
    } catch (err) {
      console.error('Failed to delete post')
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'users'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Posts ({posts.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://placehold.co/40x40'}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{u.fullName}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {u.isVerified && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            ✓ Verified
                          </span>
                        )}
                        {u.isBanned && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                            🚫 Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {!u.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(u._id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 font-medium"
                          >
                            Verify
                          </button>
                        )}
                        {!u.isBanned && (
                          <button
                            onClick={() => handleBanUser(u._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 font-medium"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      By <span className="font-medium">{post.author.fullName}</span> (@{post.author.username})
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium text-sm"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}