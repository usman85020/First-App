import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import NavigationHeader from "@/components/navigation-header";
import PoliceDashboard from "@/components/police-dashboard";
import CitizenPortal from "@/components/citizen-portal";
import RewardsStore from "@/components/rewards-store";

export default function HomePage() {
  const { user } = useAuth();
  const [activeInterface, setActiveInterface] = useState(() => {
    return user?.userType === "police" ? "police" : "citizen";
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        activeInterface={activeInterface}
        onInterfaceChange={setActiveInterface}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeInterface === "police" && <PoliceDashboard />}
        {activeInterface === "citizen" && <CitizenPortal />}
        {activeInterface === "rewards" && <RewardsStore />}
      </main>
    </div>
  );
}
