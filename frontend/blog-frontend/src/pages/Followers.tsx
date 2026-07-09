import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { User } from '../types'

export default function Followers() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [followers, setFollowers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!username) return
    const fetchFollowers = async () => {
      try {
        setIsLoading(true)
        const res = await userAPI.getUserFollowers(username!, 1, 50)
        setFollowers(res.data.data || [])
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to fetch followers')
        setIsLoading(false)
      }
    }
    fetchFollowers()
  }, [username])

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

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to={`/profile/${username}`} className="text-red-600 hover:text-red-700 font-medium">
            ← Back to {username}'s profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Followers of @{username}</h1>
        </div>

        {followers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No followers yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((follower) => (
              <div key={follower._id} className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                <Link
                  to={`/profile/${follower.followedBy.username}`}
                  className="flex items-center gap-4 flex-1 hover:text-red-600"
                >
                  <img
                    src={follower.followedBy.avatar || 'https://placehold.co/50x50'}
                    alt={follower.followedBy.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{follower.followedBy.fullName}</p>
                    <p className="text-sm text-gray-600">@{follower.followedBy.username}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}