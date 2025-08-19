import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Clock, MapPin, Users, Star } from "lucide-react";
import type { Opportunity, Application } from "@shared/schema";

export default function CitizenPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: opportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: myApplications = [] } = useQuery<Application[]>({
    queryKey: ["/api/applications/my"],
    enabled: !!user && user.userType === "citizen",
  });

  const applyMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const res = await apiRequest("POST", "/api/applications", { opportunityId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/my"] });
      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || opportunity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const hasApplied = (opportunityId: string) => {
    return myApplications.some(app => app.opportunityId === opportunityId);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      traffic_management: "bg-blue-100 text-blue-800",
      community_events: "bg-orange-100 text-orange-800",
      awareness_campaigns: "bg-purple-100 text-purple-800",
      emergency_response: "bg-red-100 text-red-800",
      safety_initiative: "bg-green-100 text-green-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      pending: "bg-police-yellow-100 text-police-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-police-blue-100 text-police-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Citizen Portal</h2>
          <p className="text-gray-600">Find volunteer opportunities and earn Good Citizen Credits</p>
        </div>
        <div className="mt-4 md:mt-0 bg-police-yellow-100 border border-police-yellow-300 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-police-yellow-500 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Credits</p>
              <p className="text-2xl font-bold text-police-yellow-700" data-testid="text-user-credits">
                {user?.credits || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search volunteer opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-opportunities"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40" data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="traffic_management">Traffic Management</SelectItem>
                <SelectItem value="community_events">Community Events</SelectItem>
                <SelectItem value="awareness_campaigns">Awareness Campaigns</SelectItem>
                <SelectItem value="emergency_response">Emergency Response</SelectItem>
                <SelectItem value="safety_initiative">Safety Initiative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Available Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredOpportunities.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500" data-testid="text-no-opportunities">No opportunities found.</p>
          </div>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow" data-testid={`card-opportunity-${opportunity.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`text-opportunity-title-${opportunity.id}`}>
                      {opportunity.title}
                    </h3>
                    <Badge className={getCategoryBadgeColor(opportunity.category)}>
                      {formatCategory(opportunity.category)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-police-yellow-600">
                      <Star className="h-4 w-4" />
                      <span className="font-semibold" data-testid={`text-credits-${opportunity.id}`}>
                        {opportunity.creditsReward} Credits
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{opportunity.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(opportunity.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{opportunity.duration} hours</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>0/{opportunity.volunteersNeeded} volunteers applied</span>
                  </div>
                </div>
                
                <Progress value={0} className="mb-4" />
                
                <Button
                  onClick={() => applyMutation.mutate(opportunity.id)}
                  disabled={hasApplied(opportunity.id) || applyMutation.isPending}
                  className="w-full bg-police-blue-600 hover:bg-police-blue-700"
                  data-testid={`button-apply-${opportunity.id}`}
                >
                  {hasApplied(opportunity.id) ? "Already Applied" : "Apply Now"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* My Applications */}
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {myApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500" data-testid="text-no-applications">No applications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((application) => {
                const opportunity = opportunities.find(opp => opp.id === application.opportunityId);
                return (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`row-application-${application.id}`}>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900" data-testid={`text-application-title-${application.id}`}>
                        {opportunity?.title || "Unknown Opportunity"}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusBadgeColor(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                      {application.status === "completed" && opportunity && (
                        <div className="flex items-center space-x-1 text-police-yellow-600">
                          <Star className="h-4 w-4" />
                          <span className="font-medium">+{opportunity.creditsReward} Credits</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
