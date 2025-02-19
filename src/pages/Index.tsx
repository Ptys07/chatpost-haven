
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentication logic will be implemented here
    toast({
      title: "Coming soon",
      description: "Authentication system will be implemented in the next step",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 glass-panel fade-in">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Choose a username"
                className="bg-secondary"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="bg-secondary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="bg-secondary"
            />
          </div>
          
          <Button className="w-full hover-scale" type="submit">
            {isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-white transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
