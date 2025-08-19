import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Clock, CheckCircle, Activity, Filter } from "lucide-react";
import type { Opportunity, InsertOpportunity } from "@shared/schema";

export default function PoliceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: stats } = useQuery<{
    activeOpportunities: number;
    totalVolunteers: number;
    pendingApplications: number;
    completedTasks: number;
  }>({
    queryKey: ["/api/police/stats"],
    enabled: !!user && user.userType === "police",
  });

  const { data: opportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities/my"],
    enabled: !!user && user.userType === "police",
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: InsertOpportunity) => {
      const res = await apiRequest("POST", "/api/opportunities", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/police/stats"] });
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Volunteer opportunity created successfully!",
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

  const handleCreateOpportunity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const opportunityData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      duration: formData.get("duration") as string,
      volunteersNeeded: formData.get("volunteersNeeded") as string,
      creditsReward: formData.get("creditsReward") as string,
      isActive: true,
    };

    console.log("Submitting opportunity data:", opportunityData);
    createOpportunityMutation.mutate(opportunityData);
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Police Dashboard</h2>
          <p className="text-gray-600">Manage volunteer opportunities and monitor community engagement</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mt-4 md:mt-0 bg-police-blue-600 hover:bg-police-blue-700"
          data-testid="button-create-opportunity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Opportunity
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Opportunities</p>
                <p className="text-3xl font-bold text-police-blue-800" data-testid="stat-active-opportunities">
                  {stats?.activeOpportunities ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-police-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-police-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Volunteers</p>
                <p className="text-3xl font-bold text-green-600" data-testid="stat-total-volunteers">
                  {stats?.totalVolunteers ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Applications</p>
                <p className="text-3xl font-bold text-police-yellow-600" data-testid="stat-pending-applications">
                  {stats?.pendingApplications ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-police-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-police-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completed Tasks</p>
                <p className="text-3xl font-bold text-police-red-600" data-testid="stat-completed-tasks">
                  {stats?.completedTasks ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-police-red-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-police-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Opportunity Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Volunteer Opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOpportunity} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter opportunity title"
                    required
                    data-testid="input-opportunity-title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger data-testid="select-opportunity-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traffic_management">Traffic Management</SelectItem>
                      <SelectItem value="community_events">Community Events</SelectItem>
                      <SelectItem value="awareness_campaigns">Awareness Campaigns</SelectItem>
                      <SelectItem value="emergency_response">Emergency Response</SelectItem>
                      <SelectItem value="safety_initiative">Safety Initiative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe the volunteer opportunity and requirements"
                  required
                  data-testid="textarea-opportunity-description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    required
                    data-testid="input-opportunity-date"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    placeholder="4"
                    required
                    data-testid="input-opportunity-duration"
                  />
                </div>
                <div>
                  <Label htmlFor="volunteersNeeded">Volunteers Needed</Label>
                  <Input
                    id="volunteersNeeded"
                    name="volunteersNeeded"
                    type="number"
                    min="1"
                    placeholder="20"
                    required
                    data-testid="input-opportunity-volunteers"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter location"
                    required
                    data-testid="input-opportunity-location"
                  />
                </div>
                <div>
                  <Label htmlFor="creditsReward">Credits Reward</Label>
                  <Input
                    id="creditsReward"
                    name="creditsReward"
                    type="number"
                    min="1"
                    placeholder="50"
                    required
                    data-testid="input-opportunity-credits"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-police-blue-600 hover:bg-police-blue-700"
                  disabled={createOpportunityMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Opportunities Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Active Volunteer Opportunities</CardTitle>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Select>
                <SelectTrigger className="w-40" data-testid="filter-category">
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
              <Button variant="outline" size="sm" data-testid="button-filter">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500" data-testid="text-no-opportunities">No opportunities created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity.id} data-testid={`row-opportunity-${opportunity.id}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900" data-testid={`text-title-${opportunity.id}`}>
                            {opportunity.title}
                          </p>
                          <p className="text-sm text-gray-500">{opportunity.description.substring(0, 100)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getCategoryBadgeColor(opportunity.category)}>
                          {formatCategory(opportunity.category)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(opportunity.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        0/{opportunity.volunteersNeeded}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {opportunity.creditsReward}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
