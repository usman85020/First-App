import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star, ArrowUp, ArrowDown, Gift, Coffee, ShoppingBag, Film, Dumbbell, Utensils, Glasses } from "lucide-react";
import type { Reward, Transaction } from "@shared/schema";

export default function RewardsStore() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: allRewards = [] } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const { data: featuredRewards = [] } = useQuery<Reward[]>({
    queryKey: ["/api/rewards/featured"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/my"],
    enabled: !!user,
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await apiRequest("POST", `/api/rewards/${rewardId}/redeem`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/my"] });
      toast({
        title: "Reward Redeemed!",
        description: `Voucher code: ${data.voucherCode}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const nonFeaturedRewards = allRewards.filter(reward => !reward.isFeatured);

  const getRewardIcon = (brand: string) => {
    const icons = {
      Starbucks: Coffee,
      Lenskart: Glasses,
      Zomato: Utensils,
      Amazon: ShoppingBag,
      BookMyShow: Film,
      "Cult.fit": Dumbbell,
    };
    const IconComponent = icons[brand as keyof typeof icons] || Gift;
    return <IconComponent className="h-6 w-6 text-white" />;
  };

  const getBrandGradient = (brand: string) => {
    const gradients = {
      Starbucks: "from-green-600 to-green-700",
      Lenskart: "from-blue-600 to-purple-600",
      Zomato: "from-red-600 to-pink-600",
      Amazon: "from-orange-500 to-red-500",
      BookMyShow: "from-blue-500 to-indigo-500",
      "Cult.fit": "from-green-500 to-teal-500",
    };
    return gradients[brand as keyof typeof gradients] || "from-gray-500 to-gray-600";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Food & Dining": "bg-green-100 text-green-800",
      "Shopping": "bg-purple-100 text-purple-800",
      "Entertainment": "bg-blue-100 text-blue-800",
      "Health & Wellness": "bg-orange-100 text-orange-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const totalEarned = transactions
    .filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === "spent")
    .reduce((sum, t) => sum + t.amount, 0);

  const rewardsClaimed = transactions.filter(t => t.type === "spent").length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Rewards Store</h2>
          <p className="text-gray-600">Redeem your Good Citizen Credits for exclusive discounts</p>
        </div>
        <div className="mt-4 md:mt-0 bg-police-yellow-100 border border-police-yellow-300 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-police-yellow-500 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Credits</p>
              <p className="text-2xl font-bold text-police-yellow-700" data-testid="text-available-credits">
                {user?.credits || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Earned</p>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-total-earned">{totalEarned}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-police-red-600" data-testid="stat-total-spent">{totalSpent}</p>
              </div>
              <div className="w-12 h-12 bg-police-red-100 rounded-lg flex items-center justify-center">
                <ArrowDown className="h-6 w-6 text-police-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Rewards Claimed</p>
                <p className="text-2xl font-bold text-police-blue-600" data-testid="stat-rewards-claimed">{rewardsClaimed}</p>
              </div>
              <div className="w-12 h-12 bg-police-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="h-6 w-6 text-police-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Rewards */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Featured Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRewards.map((reward) => (
            <Card key={reward.id} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-featured-reward-${reward.id}`}>
              <div className={`h-32 bg-gradient-to-r ${getBrandGradient(reward.brand)} flex items-center justify-center`}>
                <div className="text-center text-white">
                  {getRewardIcon(reward.brand)}
                  <p className="font-bold text-lg mt-2">{reward.brand}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900" data-testid={`text-reward-title-${reward.id}`}>
                    {reward.title}
                  </h4>
                  <Badge className="bg-police-yellow-100 text-police-yellow-800">
                    Featured
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-police-yellow-600">
                    <Star className="h-4 w-4" />
                    <span className="font-semibold" data-testid={`text-credits-required-${reward.id}`}>
                      {reward.creditsRequired} Credits
                    </span>
                  </div>
                  <Button
                    onClick={() => redeemMutation.mutate(reward.id)}
                    disabled={!user || user.credits < reward.creditsRequired || redeemMutation.isPending}
                    className="bg-police-blue-600 hover:bg-police-blue-700"
                    data-testid={`button-redeem-${reward.id}`}
                  >
                    {redeemMutation.isPending ? "Redeeming..." : "Redeem"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">All Rewards</h3>
              <Select>
                <SelectTrigger className="w-40" data-testid="select-rewards-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="health">Health & Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {nonFeaturedRewards.map((reward) => (
              <Card key={reward.id} className="p-6" data-testid={`card-reward-${reward.id}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getBrandGradient(reward.brand)} rounded-lg flex items-center justify-center`}>
                    {getRewardIcon(reward.brand)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900" data-testid={`text-reward-title-${reward.id}`}>
                        {reward.title}
                      </h4>
                      <div className="flex items-center space-x-1 text-police-yellow-600">
                        <Star className="h-4 w-4" />
                        <span className="font-semibold" data-testid={`text-credits-required-${reward.id}`}>
                          {reward.creditsRequired} Credits
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(reward.category)}>
                        {reward.category}
                      </Badge>
                      <Button
                        onClick={() => redeemMutation.mutate(reward.id)}
                        disabled={!user || user.credits < reward.creditsRequired || redeemMutation.isPending}
                        className="bg-police-blue-600 hover:bg-police-blue-700"
                        data-testid={`button-redeem-${reward.id}`}
                      >
                        {redeemMutation.isPending ? "Redeeming..." : "Redeem"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History Sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4" data-testid="text-no-transactions">
                No transactions yet.
              </p>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between pb-3 border-b border-gray-100" data-testid={`row-transaction-${transaction.id}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === "earned" ? "bg-green-100" : "bg-police-red-100"
                      }`}>
                        {transaction.type === "earned" ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-police-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900" data-testid={`text-transaction-description-${transaction.id}`}>
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${
                      transaction.type === "earned" ? "text-green-600" : "text-police-red-600"
                    }`} data-testid={`text-transaction-amount-${transaction.id}`}>
                      {transaction.type === "earned" ? "+" : "-"}{transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {transactions.length > 5 && (
              <Button variant="ghost" className="w-full mt-4 text-police-blue-600" data-testid="button-view-all-transactions">
                View All Transactions
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
