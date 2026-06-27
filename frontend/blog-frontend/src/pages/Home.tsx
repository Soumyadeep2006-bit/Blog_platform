import Navbar from "../components/Navbar"
import {useEffect,useState} from "react"
import {Link} from "react-router-dom"
import { postAPI } from "../services/api"
import {Post} from "../types/index"

function Home() {
  const [posts,setPosts]=useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)


  const fetchPosts=async(pageNum:number)=>{
    try{
      setIsLoading(true)
      const response= await postAPI.getAllPosts(pageNum,10)
       setPosts(response.data.data.posts)
        setTotalPages(response.data.data.pagination.totalPages)
        setError(null)

    }catch(error:any){
      setError(error.response?.data?.message||"Failed to Load Posts")

    }finally{
      setIsLoading(false)
    }
  }

   useEffect(() => {
    fetchPosts(page)
  }, [page])



  return (
   <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Latest Articles</h1>
          <p className="text-gray-600">Read the latest blog posts from our community</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-600"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.author.avatar || 'https://placehold.co/600x400/png?text=no img'}
                        alt={post.author.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{post.author.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {post.author.isVerified && (
                        <span className="text-blue-600 font-bold">✓</span>
                      )}
                    </div>

                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}

                    <Link to={`/post/${post.slug}`}>
                      <h2 className="text-2xl font-bold text-gray-900 hover:text-red-600 transition mb-2">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.body.replace(/<[^>]*>/g, '')}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/post/${post.slug}`}
                      className="text-red-600 font-semibold hover:text-red-700 transition"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 font-medium"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home