
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storage, Post, Comment, User } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import { MessageSquare, Trash2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
    const allUsers = storage.getAllUsers().reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, User>);
    
    setPosts(allPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setUsers(allUsers);
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {users[post.userId]?.profileImage ? (
                <img
                  src={users[post.userId].profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{users[post.userId]?.username}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(post.createdAt), 'PPpp')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-base">{post.content}</p>
            
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post content"
                className="rounded-lg max-h-96 object-cover"
              />
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

            {(user?.id === post.userId || user?.isAdmin) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeletePost(post.id)}
                className="float-right"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {activeCommentPost === post.id && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-secondary"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                />
                <Button onClick={() => handleAddComment(post.id)}>
                  Post
                </Button>
              </div>

              <div className="space-y-4">
                {comments[post.id]?.map(comment => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-3 bg-secondary/50 p-3 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                      {users[comment.userId]?.profileImage ? (
                        <img
                          src={users[comment.userId].profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">
                          {users[comment.userId]?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), 'Pp')}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Home;
