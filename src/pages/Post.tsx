
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';

const Post = () => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !content.trim()) return;

    storage.createPost(user.id, content, imageUrl);
    toast({
      title: "Success",
      description: "Post created successfully",
    });
    navigate('/home');
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 glass-panel">
      <h1 className="text-2xl font-semibold mb-6">Create a Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[120px] bg-secondary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Choose Image
            </Button>
          </div>
        </div>

        {imageUrl && (
          <div className="rounded-lg overflow-hidden bg-secondary/50">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        <Button type="submit" className="w-full">
          Create Post
        </Button>
      </form>
    </Card>
  );
};

export default Post;
