import { 
  users, 
  opportunities, 
  applications, 
  rewards, 
  transactions, 
  redemptions,
  type User, 
  type InsertUser,
  type Opportunity,
  type InsertOpportunity,
  type Application,
  type InsertApplication,
  type Reward,
  type InsertReward,
  type Transaction,
  type InsertTransaction,
  type Redemption,
  type InsertRedemption
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: string, amount: number): Promise<void>;

  // Opportunity operations
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: string): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity & { createdById: string }): Promise<Opportunity>;
  updateOpportunity(id: string, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  getOpportunitiesByCreator(creatorId: string): Promise<Opportunity[]>;

  // Application operations
  getApplications(): Promise<Application[]>;
  getApplicationsByUser(userId: string): Promise<Application[]>;
  getApplicationsByOpportunity(opportunityId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: "pending" | "approved" | "rejected" | "completed"): Promise<Application | undefined>;

  // Reward operations
  getRewards(): Promise<Reward[]>;
  getFeaturedRewards(): Promise<Reward[]>;
  getReward(id: string): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;

  // Statistics
  getPoliceStats(policeId: string): Promise<{
    activeOpportunities: number;
    totalVolunteers: number;
    pendingApplications: number;
    completedTasks: number;
  }>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserCredits(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({ credits: amount })
      .where(eq(users.id, userId));
  }

  async getOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).where(eq(opportunities.isActive, true)).orderBy(desc(opportunities.createdAt));
  }

  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity || undefined;
  }

  async createOpportunity(opportunity: InsertOpportunity & { createdById: string }): Promise<Opportunity> {
    const [created] = await db
      .insert(opportunities)
      .values(opportunity)
      .returning();
    return created;
  }

  async updateOpportunity(id: string, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const [updated] = await db
      .update(opportunities)
      .set(opportunity)
      .where(eq(opportunities.id, id))
      .returning();
    return updated || undefined;
  }

  async getOpportunitiesByCreator(creatorId: string): Promise<Opportunity[]> {
    return await db.select().from(opportunities).where(eq(opportunities.createdById, creatorId)).orderBy(desc(opportunities.createdAt));
  }

  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.appliedAt));
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.appliedAt));
  }

  async getApplicationsByOpportunity(opportunityId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.opportunityId, opportunityId)).orderBy(desc(applications.appliedAt));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [created] = await db
      .insert(applications)
      .values(application)
      .returning();
    return created;
  }

  async updateApplicationStatus(id: string, status: "pending" | "approved" | "rejected" | "completed"): Promise<Application | undefined> {
    const [updated] = await db
      .update(applications)
      .set({ 
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {})
      })
      .where(eq(applications.id, id))
      .returning();
    return updated || undefined;
  }

  async getRewards(): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.isActive, true));
  }

  async getFeaturedRewards(): Promise<Reward[]> {
    return await db.select().from(rewards).where(and(eq(rewards.isActive, true), eq(rewards.isFeatured, true)));
  }

  async getReward(id: string): Promise<Reward | undefined> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id));
    return reward || undefined;
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [created] = await db
      .insert(rewards)
      .values(reward)
      .returning();
    return created;
  }

  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    const [created] = await db
      .insert(redemptions)
      .values(redemption)
      .returning();
    return created;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return created;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async getPoliceStats(policeId: string): Promise<{
    activeOpportunities: number;
    totalVolunteers: number;
    pendingApplications: number;
    completedTasks: number;
  }> {
    const activeOpportunities = await db
      .select({ count: count() })
      .from(opportunities)
      .where(and(eq(opportunities.createdById, policeId), eq(opportunities.isActive, true)));

    const totalVolunteers = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .where(and(eq(opportunities.createdById, policeId), eq(applications.status, "approved")));

    const pendingApplications = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .where(and(eq(opportunities.createdById, policeId), eq(applications.status, "pending")));

    const completedTasks = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .where(and(eq(opportunities.createdById, policeId), eq(applications.status, "completed")));

    return {
      activeOpportunities: activeOpportunities[0]?.count || 0,
      totalVolunteers: totalVolunteers[0]?.count || 0,
      pendingApplications: pendingApplications[0]?.count || 0,
      completedTasks: completedTasks[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
