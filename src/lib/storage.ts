
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profileImage: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string | null;
  groupId: string | null;
  content: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
}

class LocalStorage {
  private getItem<T>(key: string): T[] {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  }

  private setItem<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // User methods
  async createUser(username: string, email: string, password: string): Promise<User | null> {
    const users = this.getItem<User>('users');
    
    // Check if username or email already exists
    if (users.some(u => u.username === username || u.email === email)) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      password: hashedPassword,
      profileImage: '', // Default profile image will be handled by UI
      isAdmin: username === 'admin',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.setItem('users', users);
    return newUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const users = this.getItem<User>('users');
    const user = users.find(u => u.email === email);
    
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Post methods
  createPost(userId: string, content: string, imageUrl?: string): Post {
    const posts = this.getItem<Post>('posts');
    const newPost: Post = {
      id: crypto.randomUUID(),
      userId,
      content,
      imageUrl,
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    this.setItem('posts', posts);
    return newPost;
  }

  getPosts(): Post[] {
    return this.getItem<Post>('posts');
  }

  deletePost(postId: string, userId: string): boolean {
    const posts = this.getItem<Post>('posts');
    const user = this.getItem<User>('users').find(u => u.id === userId);
    
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return false;
    
    if (posts[postIndex].userId === userId || user?.isAdmin) {
      posts.splice(postIndex, 1);
      this.setItem('posts', posts);
      return true;
    }
    
    return false;
  }

  // Comment methods
  createComment(postId: string, userId: string, content: string): Comment {
    const comments = this.getItem<Comment>('comments');
    const newComment: Comment = {
      id: crypto.randomUUID(),
      postId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    this.setItem('comments', comments);
    return newComment;
  }

  getComments(postId: string): Comment[] {
    return this.getItem<Comment>('comments').filter(c => c.postId === postId);
  }

  // Message methods
  createMessage(senderId: string, content: string, receiverId?: string, groupId?: string): Message {
    const messages = this.getItem<Message>('messages');
    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId,
      receiverId: receiverId || null,
      groupId: groupId || null,
      content,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    this.setItem('messages', messages);
    return newMessage;
  }

  getMessages(userId: string, receiverId?: string, groupId?: string): Message[] {
    const messages = this.getItem<Message>('messages');
    if (groupId) {
      return messages.filter(m => m.groupId === groupId);
    }
    if (receiverId) {
      return messages.filter(m => 
        (m.senderId === userId && m.receiverId === receiverId) ||
        (m.senderId === receiverId && m.receiverId === userId)
      );
    }
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  }

  // Group methods
  createGroup(name: string, members: string[]): Group {
    const groups = this.getItem<Group>('groups');
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      members,
      createdAt: new Date().toISOString()
    };

    groups.push(newGroup);
    this.setItem('groups', groups);
    return newGroup;
  }

  getGroups(userId: string): Group[] {
    return this.getItem<Group>('groups').filter(g => g.members.includes(userId));
  }
}

export const storage = new LocalStorage();
