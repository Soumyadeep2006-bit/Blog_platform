import { useState } from 'react'
import { commentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Comment } from '../types'
import { Link } from 'react-router-dom'

interface CommentThreadProps {
  comment: Comment
  postId: string
  onReplyAdded: () => void
  isTopLevel?:boolean
}

export default function CommentThread({ 
  comment, 
  postId, 
  onReplyAdded ,
  isTopLevel=true
}: CommentThreadProps) {
  const { isAuthenticated, user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddReply = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!replyBody.trim()) return

    try {
      setIsSubmittingReply(true)
      await commentAPI.addReply(postId, comment._id, { body: replyBody })
      setReplyBody('')
      setShowReplyForm(false)
      setShowReplies(true)
      onReplyAdded()
    } catch (err) {
      console.error('Failed to add reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleDeleteComment = async () => {
    try {
      setIsDeleting(true)
      await commentAPI.deleteComment(comment._id)
      onReplyAdded()
    } catch (err) {
      console.error('Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
  }

  const replyCount = comment.replies?.length || 0

  return (
    <div className={isTopLevel ? "mb-6 border-l-4 border-red-500" : "mb-6"}>
      {/* Main Comment */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-start gap-4">
          <img
            src={comment.author.avatar || 'https://placehold.co/600x400/grey/white?text=no+image'}
            alt={comment.author.fullName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-2 flex-wrap">
             <Link 
  to={`/profile/${comment.author.username}`}
  className="font-semibold text-gray-900 hover:text-red-600"
>
  {comment.author.fullName}
</Link>
              {comment.author.isVerified && (
                <span className="text-blue-600">✓</span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>

            {/* Comment Body with mention */}
            <p className="mt-2 text-gray-700 break-words">
              {comment.replyingTo && (
                <span className="text-blue-600 font-medium">
                  @{comment.replyingTo.username}{' '}
                </span>
              )}
              {comment.body}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-3 flex-wrap">
              {isAuthenticated && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {showReplyForm ? 'Cancel' : 'Reply'}
                </button>
              )}
              
              {/* Show Replies Button */}
              {replyCount > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showReplies ? '▼ Hide Replies' : `► Show Replies (${replyCount})`}
                </button>
              )}

              {/* Delete Button - only show if user is author */}
              {isAuthenticated && user?._id === comment.author._id && (
                <button
                  onClick={() => {
                    if (confirm('Delete this comment?')) {
                      handleDeleteComment()
                    }
                  }}
                  disabled={isDeleting}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleAddReply} className="mt-4 ml-14 bg-gray-50 p-4 rounded-lg">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <button
              type="submit"
              disabled={isSubmittingReply || !replyBody.trim()}
              className="mt-2 px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {isSubmittingReply ? 'Posting...' : 'Reply'}
            </button>
          </form>
        )}
      </div>

      {/* Nested Replies - Flat, no indentation */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply._id}
              comment={reply}
              postId={postId}
              onReplyAdded={onReplyAdded}
              isTopLevel={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}