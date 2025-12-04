import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// UPI Transactions table - core transaction data
export const upiTransactions = pgTable(
  "upi_transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    transactionId: varchar("transaction_id").notNull().unique(),
    senderUpi: varchar("sender_upi").notNull(),
    receiverUpi: varchar("receiver_upi").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    status: varchar("status", {
      enum: ["pending", "success", "failed"],
    }).notNull(),
    description: text("description"),
    // Metadata for analysis
    deviceInfo: jsonb("device_info"), // OS, app version, device ID
    location: jsonb("location"), // lat, long, city, country
    merchantName: varchar("merchant_name"),
    riskScore: decimal("risk_score", { precision: 5, scale: 2 }).default("0"),
    isFraudulent: boolean("is_fraudulent").default(false),
    flaggedReason: text("flagged_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    senderUpiIdx: index("sender_upi_idx").on(table.senderUpi),
    receiverUpiIdx: index("receiver_upi_idx").on(table.receiverUpi),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
    fraudIdx: index("fraud_idx").on(table.isFraudulent),
  })
);

// User Profiles - behavioral baseline for fraud detection
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    upiAddress: varchar("upi_address").notNull().unique(),
    displayName: varchar("display_name"),
    bankName: varchar("bank_name"),
    trustScore: decimal("trust_score", { precision: 5, scale: 2 })
      .notNull()
      .default("50"),
    totalTransactions: integer("total_transactions").default(0),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default(
      "0"
    ),
    avgTransactionAmount: decimal("avg_transaction_amount", {
      precision: 12,
      scale: 2,
    }).default("0"),
    frequentLocations: jsonb("frequent_locations"), // array of {city, count, lastSeen}
    frequentContacts: jsonb("frequent_contacts"), // array of frequently transacted UPIs
    isVerified: boolean("is_verified").default(false),
    kycStatus: varchar("kyc_status", {
      enum: ["pending", "verified", "rejected"],
    }).default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    upiIdx: uniqueIndex("upi_address_idx").on(table.upiAddress),
  })
);

// Fraud Patterns - known scam tactics
export const fraudPatterns = pgTable(
  "fraud_patterns",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    category: varchar("category", {
      enum: [
        "verification_scam",
        "refund_scam",
        "impersonation",
        "qr_swap",
        "phishing",
        "identity_theft",
        "social_engineering",
        "other",
      ],
    }).notNull(),
    severity: varchar("severity", {
      enum: ["low", "medium", "high", "critical"],
    }).notNull(),
    pattern: jsonb("pattern").notNull(), // Rules engine config
    detectionRules: jsonb("detection_rules"), // Conditions to match
    indicators: jsonb("indicators"), // Red flags array
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    severityIdx: index("severity_idx").on(table.severity),
  })
);

// Detection Events - logs of fraud detection
export const detectionEvents = pgTable(
  "detection_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    transactionId: varchar("transaction_id").notNull(),
    patternId: varchar("pattern_id"),
    detectionMethod: varchar("detection_method", {
      enum: [
        "behavioral_analysis",
        "pattern_matching",
        "anomaly_detection",
        "velocity_check",
        "device_fingerprint",
      ],
    }).notNull(),
    riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(),
    confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
    flagDetails: jsonb("flag_details"), // Detailed reason object
    action: varchar("action", {
      enum: ["alert", "block", "verify", "approve"],
    }).notNull(),
    isAccurate: boolean("is_accurate"), // For ML model training
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    transactionIdx: index("detection_transaction_idx").on(table.transactionId),
    methodIdx: index("detection_method_idx").on(table.detectionMethod),
  })
);

// Fraud Alerts - actionable alerts for users/admins
export const fraudAlerts = pgTable(
  "fraud_alerts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    transactionId: varchar("transaction_id").notNull(),
    alertType: varchar("alert_type", {
      enum: [
        "suspicious_activity",
        "unusual_pattern",
        "device_anomaly",
        "location_anomaly",
        "velocity_exceeded",
      ],
    }).notNull(),
    severity: varchar("severity", {
      enum: ["info", "warning", "critical"],
    }).notNull(),
    title: varchar("title").notNull(),
    message: text("message").notNull(),
    actionRequired: boolean("action_required").default(false),
    status: varchar("status", {
      enum: ["new", "acknowledged", "resolved", "false_positive"],
    }).default("new"),
    userResponse: jsonb("user_response"), // User's response to alert
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    userIdx: index("alert_user_idx").on(table.userId),
    statusIdx: index("alert_status_idx").on(table.status),
  })
);

// Blacklist - Known fraudulent UPIs/devices
export const blacklistEntries = pgTable(
  "blacklist_entries",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    identifier: varchar("identifier").notNull(), // UPI, phone, device ID, etc
    identifierType: varchar("identifier_type", {
      enum: ["upi", "phone", "device_id", "email", "ip_address"],
    }).notNull(),
    reason: text("reason").notNull(),
    severity: varchar("severity", {
      enum: ["low", "medium", "high", "critical"],
    }).notNull(),
    reportedBy: varchar("reported_by"),
    reportCount: integer("report_count").default(1),
    isActive: boolean("is_active").default(true),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    identifierIdx: uniqueIndex("blacklist_identifier_idx").on(
      table.identifier,
      table.identifierType
    ),
    typeIdx: index("blacklist_type_idx").on(table.identifierType),
  })
);

// Zod schemas for validation
export const insertTransactionSchema = createInsertSchema(upiTransactions).pick({
  transactionId: true,
  senderUpi: true,
  receiverUpi: true,
  amount: true,
  status: true,
  description: true,
  deviceInfo: true,
  location: true,
  merchantName: true,
});

export const insertFraudPatternSchema = createInsertSchema(fraudPatterns).pick({
  name: true,
  description: true,
  category: true,
  severity: true,
  pattern: true,
  detectionRules: true,
  indicators: true,
});

export type Transaction = typeof upiTransactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type FraudPattern = typeof fraudPatterns.$inferSelect;
export type DetectionEvent = typeof detectionEvents.$inferSelect;
export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type BlacklistEntry = typeof blacklistEntries.$inferSelect;
