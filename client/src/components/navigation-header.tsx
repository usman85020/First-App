import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

interface NavigationHeaderProps {
  activeInterface: string;
  onInterfaceChange: (interfaceType: string) => void;
}

export default function NavigationHeader({ activeInterface, onInterfaceChange }: NavigationHeaderProps) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-police-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-police-yellow-500 rounded-full flex items-center justify-center">
              <Shield className="text-police-blue-800 text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Mumbai Police</h1>
              <p className="text-police-blue-100 text-sm">Volunteer Portal</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {user?.userType === "police" && (
              <Button
                variant={activeInterface === "police" ? "default" : "ghost"}
                onClick={() => onInterfaceChange("police")}
                className={activeInterface === "police" 
                  ? "bg-police-yellow-500 text-police-blue-800 hover:bg-police-yellow-600" 
                  : "hover:bg-police-blue-700 text-white"
                }
                data-testid="nav-police-dashboard"
              >
                Police Dashboard
              </Button>
            )}
            
            <Button
              variant={activeInterface === "citizen" ? "default" : "ghost"}
              onClick={() => onInterfaceChange("citizen")}
              className={activeInterface === "citizen" 
                ? "bg-police-yellow-500 text-police-blue-800 hover:bg-police-yellow-600" 
                : "hover:bg-police-blue-700 text-white"
              }
              data-testid="nav-citizen-portal"
            >
              Citizen Portal
            </Button>
            
            <Button
              variant={activeInterface === "rewards" ? "default" : "ghost"}
              onClick={() => onInterfaceChange("rewards")}
              className={activeInterface === "rewards" 
                ? "bg-police-yellow-500 text-police-blue-800 hover:bg-police-yellow-600" 
                : "hover:bg-police-blue-700 text-white"
              }
              data-testid="nav-rewards-store"
            >
              Rewards Store
            </Button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium" data-testid="text-user-name">{user?.name}</p>
              <p className="text-xs text-police-blue-200" data-testid="text-user-type">
                {user?.userType === "police" ? `Badge #${user.badgeNumber || "N/A"}` : `Credits: ${user?.credits || 0}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-police-blue-700 rounded-full hover:bg-police-blue-600"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-2">
            {user?.userType === "police" && (
              <Button
                variant={activeInterface === "police" ? "default" : "ghost"}
                size="sm"
                onClick={() => onInterfaceChange("police")}
                className={`flex-1 ${activeInterface === "police" 
                  ? "bg-police-yellow-500 text-police-blue-800" 
                  : "hover:bg-police-blue-700 text-white"
                }`}
                data-testid="nav-mobile-police"
              >
                Police
              </Button>
            )}
            
            <Button
              variant={activeInterface === "citizen" ? "default" : "ghost"}
              size="sm"
              onClick={() => onInterfaceChange("citizen")}
              className={`flex-1 ${activeInterface === "citizen" 
                ? "bg-police-yellow-500 text-police-blue-800" 
                : "hover:bg-police-blue-700 text-white"
              }`}
              data-testid="nav-mobile-citizen"
            >
              Citizen
            </Button>
            
            <Button
              variant={activeInterface === "rewards" ? "default" : "ghost"}
              size="sm"
              onClick={() => onInterfaceChange("rewards")}
              className={`flex-1 ${activeInterface === "rewards" 
                ? "bg-police-yellow-500 text-police-blue-800" 
                : "hover:bg-police-blue-700 text-white"
              }`}
              data-testid="nav-mobile-rewards"
            >
              Rewards
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
