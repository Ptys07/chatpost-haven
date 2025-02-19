
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storage, Post, Comment, User } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const allPosts = storage.getPosts();
    setPosts(allPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, []);

  useEffect(() => {
    posts.forEach(post => {
      const postComments = storage.getComments(post.id);
      setComments(prev => ({ ...prev, [post.id]: postComments }));
    });
  }, [posts]);

  const handleAddComment = (postId: string) => {
    if (!newComment.trim() || !user) return;

    const comment = storage.createComment(postId, user.id, newComment);
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment],
    }));
    setNewComment('');
    setActiveCommentPost(null);
  };

  const handleDeletePost = (postId: string) => {
    if (!user) return;

    const deleted = storage.deletePost(postId, user.id);
    if (deleted) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "You don't have permission to delete this post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Card key={post.id} className="p-6 glass-panel">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">{post.content}</h3>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="mt-4 rounded-lg max-h-96 object-cover"
                />
              )}
            </div>
            
            {(user?.id === post.userId || user?.isAdmin) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeletePost(post.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-4">
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setActiveCommentPost(
                activeCommentPost === post.id ? null : post.id
              )}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {comments[post.id]?.length || 0} Comments
            </Button>

            {activeCommentPost === post.id && (
              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="bg-secondary"
                  />
                  <Button onClick={() => handleAddComment(post.id)}>
                    Post
                  </Button>
                </div>

                <div className="space-y-2">
                  {comments[post.id]?.map(comment => (
                    <div
                      key={comment.id}
                      className="bg-secondary/50 p-3 rounded-lg"
                    >
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Home;
