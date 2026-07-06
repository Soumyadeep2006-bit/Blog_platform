import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Navbar from '../components/Navbar'
import { postAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function CreatePost() {
  const navigate = useNavigate()
  const { postId } = useParams<{ postId?: string }>()
  const { isAuthenticated, user } = useAuth()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [status, setStatus] = useState<'published' | 'scheduled'>('published')
  const [scheduledAt, setScheduledAt] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(!!postId)
  const [error, setError] = useState<string | null>(null)

  const [, setEditorUpdate] = useState(0)

  useEffect(() => {
    if (!isAuthenticated&&!isLoading) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate,isLoading])

  const lowlight = createLowlight(common)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image,
      Youtube,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content: '',
    onTransaction: () => {
    setEditorUpdate(prev => prev + 1)  // ← Add this - forces re-render
  },
  })

  useEffect(() => {
    if (postId && editor) {
      const fetchPost = async () => {
        try {
          const response = await postAPI.getPost(postId)
          const post = response.data.data
          setTitle(post.title)
          setCategory(post.category)
          setTags(post.tags)
          setStatus(post.status)
          if (post.scheduledAt) setScheduledAt(post.scheduledAt)
          setCoverImagePreview(post.coverImage)
          editor.commands.setContent(post.body)
          setIsLoadingPost(false)
        } catch (err) {
          setError('Failed to load post')
          setIsLoadingPost(false)
        }
      }
      fetchPost()
    }
  }, [postId, editor])

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTagsInputChange = (value: string) => {
    setTagsInput(value)
    const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    setTags(newTags)
  }

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove)
    setTags(newTags)
    setTagsInput(newTags.join(', '))
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!editor?.getText().trim()) {
      setError('Post content is required')
      return
    }

    if (status === 'scheduled' && !scheduledAt) {
      setError('Scheduled date is required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const html = editor.getHTML()
      const formData = new FormData()
      formData.append('title', title)
      formData.append('body', html)
      formData.append('category', category)
      formData.append('tags', JSON.stringify(tags))
      formData.append('status', status)
      if (scheduledAt) formData.append('scheduledAt', scheduledAt)
      if (coverImage) formData.append('image', coverImage)

      if (postId) {
        await postAPI.updatePost(postId, formData)
      } else {
        await postAPI.createPost(formData)
      }

      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save post')
    } finally {
      setIsLoading(false)
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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {postId ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600">
            {postId ? 'Update your post' : 'Share your thoughts with the world'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="flex items-center gap-4">
              {coverImagePreview && (
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-red-500"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content *
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 p-3 border-b border-gray-300 flex flex-wrap gap-2">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor?.chain().focus().toggleBold().run()
                    
                     console.log('Button clicked!')
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    editor?.isActive('bold')
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor?.chain().focus().toggleItalic().run()
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    editor?.isActive('italic')
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    editor?.isActive('heading', { level: 2 })
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  H2
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor?.chain().focus().toggleBulletList().run()
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    editor?.isActive('bulletList')
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor?.chain().focus().toggleCodeBlock().run()
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    editor?.isActive('codeBlock')
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Code
                </button>
              </div>
              <div className="p-4 min-h-96">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a category</option>
              <option value="Technology">Technology</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => handleTagsInputChange(e.target.value)}
              placeholder="javascript, react, web development"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-red-700 hover:text-red-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value as 'published' | 'scheduled')}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Publish Now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="scheduled"
                  checked={status === 'scheduled'}
                  onChange={(e) => setStatus(e.target.value as 'published' | 'scheduled')}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Schedule</span>
              </label>
            </div>
          </div>

          {status === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Date *
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Saving...' : postId ? 'Update Post' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost