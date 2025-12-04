import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// In-memory store for development when PostgreSQL is not available
export const inMemoryStore = {
  upiTransactions: [] as any[],
  userProfiles: [] as any[],
  fraudPatterns: [] as any[],
  detectionEvents: [] as any[],
  fraudAlerts: [] as any[],
  blacklistEntries: [] as any[],
};

// Initialize with some mock data
export function initializeMockData() {
  inMemoryStore.fraudPatterns = [
    {
      id: randomUUID(),
      name: "Refund Scam",
      description: "Fake refund requests",
      severity: "high",
      isActive: true,
      detectionRules: [{ field: "amount", operator: ">", value: 10000 }],
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      name: "Verification Scam",
      description: "Fake bank verification",
      severity: "critical",
      isActive: true,
      detectionRules: [{ field: "keywords", operator: "contains", value: "verify" }],
      createdAt: new Date(),
    },
  ];
}

// Mock db interface that mimics Drizzle's builder pattern
export const db = {
  select: () => ({
    from: (table: any) => {
      // Helper to resolve table data based on table type
      const getTableData = () => {
        const tblNameRaw =
          (table && (table.name || table._def?.name || table._def?.tableName)) ||
          (typeof table === "string" ? table : null);
        const tbl = (typeof tblNameRaw === "string" ? tblNameRaw : "").toLowerCase();

        if (tbl.includes("upi_transactions")) return inMemoryStore.upiTransactions;
        if (tbl.includes("user_profiles")) return inMemoryStore.userProfiles;
        if (tbl.includes("fraud_patterns")) return inMemoryStore.fraudPatterns;
        if (tbl.includes("detection_events")) return inMemoryStore.detectionEvents;
        if (tbl.includes("fraud_alerts")) return inMemoryStore.fraudAlerts;
        if (tbl.includes("blacklist_entries")) return inMemoryStore.blacklistEntries;
        return [];
      };

      // Create a fully chainable query builder
      const createQueryBuilder = () => {
        return {
          where: (_condition: any) => createQueryBuilder(),
          orderBy: (_: any) => createQueryBuilder(),
          limit: (_n: number) => {
            // Return both a Promise and a thenable object
            const result = Promise.resolve(getTableData());
            result.then = (onFulfilled: any, onRejected?: any) =>
              Promise.resolve(getTableData()).then(onFulfilled, onRejected);
            return result;
          },
          then: (onFulfilled: any, onRejected?: any) =>
            Promise.resolve(getTableData()).then(onFulfilled, onRejected),
        };
      };

      return createQueryBuilder();
    },
  }),
  update: (table: any) => ({
    set: (values: any) => ({
      where: (_condition: any) => ({
        returning: () => Promise.resolve([{ id: randomUUID(), ...values }]),
      }),
    }),
  }),
  insert: (table: any) => ({
    values: (values: any) => ({
      returning: () => Promise.resolve([{ id: randomUUID(), ...values }]),
    }),
  }),
};

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
