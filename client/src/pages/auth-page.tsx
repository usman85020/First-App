import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Star, CheckCircle } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    setLocation("/");
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      await loginMutation.mutateAsync({ username, password });
      setLocation("/");
    } catch (error) {
      // Error handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const userData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      userType: formData.get("userType") as "police" | "citizen",
      badgeNumber: formData.get("badgeNumber") as string || undefined,
    };

    try {
      await registerMutation.mutateAsync(userData);
      setLocation("/");
    } catch (error) {
      // Error handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-police-yellow-500 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-police-blue-800" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Mumbai Police</h1>
            <p className="text-gray-600 mt-2">Volunteer Portal</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        name="username"
                        type="text"
                        required
                        data-testid="input-login-username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        required
                        data-testid="input-login-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-police-blue-600 hover:bg-police-blue-700"
                      disabled={isLoading}
                      data-testid="button-login"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        required
                        data-testid="input-register-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        name="username"
                        type="text"
                        required
                        data-testid="input-register-username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        required
                        data-testid="input-register-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-userType">Account Type</Label>
                      <Select name="userType" required>
                        <SelectTrigger data-testid="select-register-userType">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">Citizen Volunteer</SelectItem>
                          <SelectItem value="police">Police Officer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="register-badgeNumber">Badge Number (Police Only)</Label>
                      <Input
                        id="register-badgeNumber"
                        name="badgeNumber"
                        type="text"
                        placeholder="Optional for police officers"
                        data-testid="input-register-badgeNumber"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-police-blue-600 hover:bg-police-blue-700"
                      disabled={isLoading}
                      data-testid="button-register"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-police-blue-800 text-white p-8 flex items-center justify-center">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-6">Serve Your Community</h2>
          <p className="text-xl mb-8 text-police-blue-100">
            Join hands with Mumbai Police to make our city safer and stronger. 
            Volunteer for community services and earn Good Citizen Credits.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-police-yellow-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-police-blue-800" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Community Impact</h3>
                <p className="text-police-blue-100 text-sm">Make a real difference in your neighborhood</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-police-yellow-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-police-blue-800" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Earn Credits</h3>
                <p className="text-police-blue-100 text-sm">Get rewarded for your valuable service</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-police-yellow-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-police-blue-800" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Exclusive Rewards</h3>
                <p className="text-police-blue-100 text-sm">Redeem credits for brand discounts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
