
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { storage, Message, User, Group } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Send, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setGroups(storage.getGroups(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (user && (selectedUser || selectedGroup)) {
      const chatMessages = storage.getMessages(
        user.id,
        selectedUser?.id,
        selectedGroup?.id
      );
      setMessages(chatMessages);
    }
  }, [user, selectedUser, selectedGroup]);

  const handleSendMessage = () => {
    if (!user || !newMessage.trim()) return;

    storage.createMessage(
      user.id,
      newMessage,
      selectedUser?.id,
      selectedGroup?.id
    );

    const message = {
      id: crypto.randomUUID(),
      senderId: user.id,
      receiverId: selectedUser?.id || null,
      groupId: selectedGroup?.id || null,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleCreateGroup = () => {
    if (!user || !newGroupName.trim() || selectedMembers.length === 0) return;

    const group = storage.createGroup(newGroupName, [user.id, ...selectedMembers]);
    setGroups(prev => [...prev, group]);
    setNewGroupName('');
    setSelectedMembers([]);
    toast({
      title: "Success",
      description: "Group created successfully",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
      <Card className="p-4 glass-panel md:col-span-1">
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary"
          />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            {groups.map(group => (
              <Button
                key={group.id}
                variant={selectedGroup?.id === group.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedUser(null);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                {group.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4 glass-panel md:col-span-3">
        <div className="flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.senderId === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-secondary"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
