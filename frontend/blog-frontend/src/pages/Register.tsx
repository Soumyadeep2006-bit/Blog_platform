import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


function Register() {

  const [username,setUsername]=useState("")
  const [email,setEmail]=useState("")
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  

  const { register, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const handleAvatarChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(file){
      setAvatar(file)
    //Preview Image
    const reader=new FileReader()
    reader.onloadend=()=>{
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await register(username, email, fullName, password, avatar || undefined)
      navigate('/')
    } catch (err) {
      // Error already in context
    }
  }
  return (
     <div style={{ padding: '20px' }} className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="p-6 sm:p-8 md:p-10">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
              Create Your Account
            </h1>
            <p className="mt-3 text-center text-gray-500">
              Join our blog community today.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Avatar Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-4">
                {avatarPreview && (
                  <img 
                    src={avatarPreview} 
                    alt="preview" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-700"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder=" your_fullname "
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 transition duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:z-10 hover:-translate-y-1 hover:scale-110 active:z-10 active:-translate-y-1 active:scale-110"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-10 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-red-600 transition hover:text-red-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register