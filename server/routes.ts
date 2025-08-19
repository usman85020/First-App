import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOpportunitySchema, insertApplicationSchema, insertTransactionSchema, insertRedemptionSchema } from "@shared/schema";
import { randomBytes } from "crypto";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Opportunities routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== "police") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      console.log("Raw opportunity data:", req.body);
      
      // Transform date string to Date object before validation
      const transformedData = {
        ...req.body,
        date: new Date(req.body.date),
        duration: parseInt(req.body.duration),
        volunteersNeeded: parseInt(req.body.volunteersNeeded),
        creditsReward: parseInt(req.body.creditsReward),
      };
      
      const data = insertOpportunitySchema.parse(transformedData);
      console.log("Parsed opportunity data:", data);
      const opportunity = await storage.createOpportunity({
        ...data,
        createdById: req.user.id,
      });
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Opportunity validation error:", error);
      res.status(400).json({ message: "Invalid opportunity data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/opportunities/my", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== "police") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const opportunities = await storage.getOpportunitiesByCreator(req.user.id);
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  // Applications routes
  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== "citizen") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      console.log("Raw application data:", req.body);
      
      // Only validate the required opportunityId field
      const { opportunityId } = req.body;
      if (!opportunityId || typeof opportunityId !== 'string') {
        return res.status(400).json({ message: "opportunityId is required" });
      }
      
      console.log("Application for opportunity:", opportunityId);
      
      // Check if user already applied
      const existingApplications = await storage.getApplicationsByUser(req.user.id);
      const alreadyApplied = existingApplications.some(app => app.opportunityId === opportunityId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "Already applied for this opportunity" });
      }

      const application = await storage.createApplication({
        opportunityId,
        userId: req.user.id,
      });
      res.status(201).json(application);
    } catch (error) {
      console.error("Application creation error:", error);
      res.status(500).json({ message: "Failed to create application", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/applications/my", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const applications = await storage.getApplicationsByUser(req.user.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch("/api/applications/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== "police") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { status } = req.body;
      const application = await storage.updateApplicationStatus(req.params.id, status);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // If application is completed, award credits
      if (status === "completed") {
        const opportunity = await storage.getOpportunity(application.opportunityId);
        if (opportunity) {
          const user = await storage.getUser(application.userId);
          if (user) {
            const newCredits = user.credits + opportunity.creditsReward;
            await storage.updateUserCredits(user.id, newCredits);
            
            // Create transaction record
            await storage.createTransaction({
              userId: user.id,
              type: "earned",
              amount: opportunity.creditsReward,
              description: `Completed: ${opportunity.title}`,
              relatedId: opportunity.id,
            });
          }
        }
      }

      res.json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid status update" });
    }
  });

  // Rewards routes
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.get("/api/rewards/featured", async (req, res) => {
    try {
      const rewards = await storage.getFeaturedRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured rewards" });
    }
  });

  app.post("/api/rewards/:id/redeem", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const reward = await storage.getReward(req.params.id);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.credits < reward.creditsRequired) {
        return res.status(400).json({ message: "Insufficient credits" });
      }

      // Generate voucher code
      const voucherCode = `${reward.brand.toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;

      // Create redemption
      const redemption = await storage.createRedemption({
        userId: user.id,
        rewardId: reward.id,
        voucherCode,
      });

      // Deduct credits
      const newCredits = user.credits - reward.creditsRequired;
      await storage.updateUserCredits(user.id, newCredits);

      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        type: "spent",
        amount: reward.creditsRequired,
        description: `Redeemed: ${reward.title}`,
        relatedId: reward.id,
      });

      res.json({ redemption, voucherCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // Transactions routes
  app.get("/api/transactions/my", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const transactions = await storage.getTransactionsByUser(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Police stats
  app.get("/api/police/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== "police") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const stats = await storage.getPoliceStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Seed rewards endpoint (for development)
  app.post("/api/seed-rewards", async (req, res) => {
    try {
      const rewardsData = [
        {
          title: "20% Off Any Beverage",
          description: "Valid at all Mumbai Starbucks locations. Cannot be combined with other offers.",
          brand: "Starbucks",
          category: "Food & Dining",
          creditsRequired: 200,
          isActive: true,
          isFeatured: true,
        },
        {
          title: "₹500 Off Eyewear",
          description: "Get ₹500 discount on any eyewear purchase above ₹2000. Valid online and in-store.",
          brand: "Lenskart",
          category: "Shopping",
          creditsRequired: 400,
          isActive: true,
          isFeatured: true,
        },
        {
          title: "Free Delivery for 1 Month",
          description: "Enjoy free delivery on all orders for 30 days. No minimum order value required.",
          brand: "Zomato",
          category: "Food & Dining",
          creditsRequired: 300,
          isActive: true,
          isFeatured: true,
        },
        {
          title: "Amazon - ₹200 Gift Card",
          description: "Amazon gift card worth ₹200. Use for any purchase on Amazon.in",
          brand: "Amazon",
          category: "Shopping",
          creditsRequired: 500,
          isActive: true,
          isFeatured: false,
        },
        {
          title: "BookMyShow - 2 Movie Tickets",
          description: "Get 2 free movie tickets for any show in Mumbai multiplexes",
          brand: "BookMyShow",
          category: "Entertainment",
          creditsRequired: 600,
          isActive: true,
          isFeatured: false,
        },
        {
          title: "Cult.fit - 1 Week Free Pass",
          description: "Access to all Cult.fit gyms and classes for 7 days",
          brand: "Cult.fit",
          category: "Health & Wellness",
          creditsRequired: 250,
          isActive: true,
          isFeatured: false,
        },
      ];

      for (const reward of rewardsData) {
        await storage.createReward(reward);
      }

      res.json({ message: "Rewards seeded successfully", count: rewardsData.length });
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ message: "Failed to seed rewards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
