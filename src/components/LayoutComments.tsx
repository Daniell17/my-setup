import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Reply, Send, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  parentId?: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  replies?: Comment[];
}

interface Props {
  layoutId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LayoutComments({ layoutId, isOpen, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, layoutId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await api.request(`/api/comments/${layoutId}`);
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const response = await api.request('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          layoutId,
          content: newComment.trim(),
        }),
      });

      if (response.success) {
        setNewComment('');
        loadComments();
      } else {
        alert('Failed to post comment');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const response = await api.request('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          layoutId,
          content: replyContent.trim(),
          parentId,
        }),
      });

      if (response.success) {
        setReplyContent('');
        setReplyingTo(null);
        loadComments();
      } else {
        alert('Failed to post reply');
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to like comments');
      return;
    }

    try {
      const response = await api.request(`/api/comments/${commentId}/like`, {
        method: 'PUT',
      });

      if (response.success) {
        loadComments();
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const response = await api.request(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        loadComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            Comments
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No comments yet.</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-semibold">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{comment.username}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {user && comment.userId === user._id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-300 mb-3">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      user && comment.likedBy.includes(user._id)
                        ? 'text-red-400'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${user && comment.likedBy.includes(user._id) ? 'fill-current' : ''}`} />
                    {comment.likes}
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                  )}
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={isSubmitting || !replyContent.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-[10px] font-semibold">
                              {reply.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white">{reply.username}</div>
                              <div className="text-[10px] text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {user && reply.userId === user._id && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{reply.content}</p>
                        <button
                          onClick={() => handleLike(reply.id)}
                          className={`mt-2 flex items-center gap-1 text-xs transition-colors ${
                            user && reply.likedBy.includes(user._id)
                              ? 'text-red-400'
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${user && reply.likedBy.includes(user._id) ? 'fill-current' : ''}`} />
                          {reply.likes}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* New Comment Input */}
        {isAuthenticated ? (
          <div className="p-6 border-t border-gray-800">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none mb-3"
            />
            <button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-800 text-center text-gray-400">
            <p>Please log in to comment</p>
          </div>
        )}
      </div>
    </div>
  );
}

