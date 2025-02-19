
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { User, Camera } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const { toast } = useToast();

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update profile logic will be implemented here
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 glass-panel">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full"
            onClick={() => document.getElementById('profileImage')?.focus()}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={user?.username}
            disabled
            className="bg-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email}
            disabled
            className="bg-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileImage">Profile Image URL</Label>
          <Input
            id="profileImage"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="Enter image URL"
            className="bg-secondary"
          />
        </div>

        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </Card>
  );
};

export default Settings;
