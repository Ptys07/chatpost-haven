
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { storage, Message, User, Group } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Send, Plus, UserPlus, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setGroups(storage.getGroups(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const allUsers = storage.getAllUsers();
      const results = allUsers.filter(u => 
        u.id !== user?.id && 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user?.id]);

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

    const message = storage.createMessage(
      user.id,
      newMessage,
      selectedUser?.id,
      selectedGroup?.id
    );

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleCreateGroup = () => {
    if (!user || !newGroupName.trim() || selectedMembers.length === 0) return;

    const group = storage.createGroup(newGroupName, user.id, selectedMembers);
    setGroups(prev => [...prev, group]);
    setNewGroupName('');
    setSelectedMembers([]);
    toast({
      title: "Success",
      description: "Group created successfully",
    });
  };

  const handleKickMember = (groupId: string, memberId: string) => {
    if (!user) return;

    const success = storage.removeGroupMember(groupId, user.id, memberId);
    if (success) {
      const updatedGroup = storage.getGroups(user.id)
        .find(g => g.id === groupId);
      
      if (updatedGroup) {
        setGroups(prev => prev.map(g => 
          g.id === groupId ? updatedGroup : g
        ));
        
        toast({
          title: "Success",
          description: "Member removed from group",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
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
          
          {searchResults.length > 0 && (
            <Card className="p-2 space-y-2">
              {searchResults.map(searchUser => (
                <Button
                  key={searchUser.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedUser(searchUser);
                    setSelectedGroup(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  {searchUser.username}
                </Button>
              ))}
            </Card>
          )}
          
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
                <div className="space-y-2">
                  <p className="text-sm font-medium">Add Members</p>
                  {storage.getAllUsers()
                    .filter(u => u.id !== user?.id)
                    .map(possibleMember => (
                      <Button
                        key={possibleMember.id}
                        variant={selectedMembers.includes(possibleMember.id) ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedMembers(prev =>
                            prev.includes(possibleMember.id)
                              ? prev.filter(id => id !== possibleMember.id)
                              : [...prev, possibleMember.id]
                          );
                        }}
                      >
                        {possibleMember.username}
                      </Button>
                    ))}
                </div>
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
        {(selectedUser || selectedGroup) && (
          <div className="flex flex-col h-[calc(100vh-12rem)]">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selectedUser?.username || selectedGroup?.name}
                </h2>
                {selectedGroup && user?.id === selectedGroup.ownerId && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Members</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {selectedGroup.members.map(memberId => {
                          const member = storage.getUser(memberId);
                          if (!member) return null;
                          
                          return (
                            <div key={memberId} className="flex items-center justify-between">
                              <span>{member.username}</span>
                              {member.id !== user.id && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleKickMember(selectedGroup.id, member.id)}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map(message => {
                const sender = storage.getUser(message.senderId);
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="flex items-start gap-2 max-w-[70%]">
                      {message.senderId !== user?.id && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                          {sender?.profileImage ? (
                            <img
                              src={sender.profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        {selectedGroup && message.senderId !== user?.id && (
                          <p className="text-xs font-medium mb-1">
                            {sender?.username}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(message.createdAt), 'p')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
        )}
      </Card>
    </div>
  );
};

export default Chat;
