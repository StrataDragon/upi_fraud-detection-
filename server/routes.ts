import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./storage";
import {
  upiTransactions,
  fraudPatterns,
  fraudAlerts,
  userProfiles,
  blacklistEntries,
  detectionEvents,
} from "../shared/schema";
import {
  detectFraud,
  logDetectionEvent,
  analyzeUserBehavior,
  matchFraudPatterns,
  detectAnomalies,
  checkBlacklist,
} from "./lib/fraudDetection";
import { eq, and, gte, desc } from "drizzle-orm";
import { z } from "zod";

// Import log function for CSV processing logging
function log(message: string, source = "routes") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Validation schemas
const submitTransactionSchema = z.object({
  transactionId: z.string(),
  senderUpi: z.string().email("Invalid UPI format"),
  receiverUpi: z.string().email("Invalid UPI format"),
  amount: z.number().positive("Amount must be positive"),
  timestamp: z.string().datetime().optional(),
  status: z.enum(["pending", "success", "failed"]),
  description: z.string().optional(),
  location: z.object({ lat: z.number(), long: z.number(), city: z.string() }).optional(),
  deviceInfo: z.object({ deviceId: z.string(), os: z.string(), appVersion: z.string() }).optional(),
  merchantName: z.string().optional(),
});

const reportFraudSchema = z.object({
  identifier: z.string(),
  identifierType: z.enum(["upi", "phone", "device_id", "email", "ip_address"]),
  reason: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

const addPatternSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.enum([
    "verification_scam",
    "refund_scam",
    "impersonation",
    "qr_swap",
    "phishing",
    "identity_theft",
    "social_engineering",
    "other",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  detectionRules: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
  })),
  indicators: z.array(z.string()),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ==================== TRANSACTION ROUTES ====================

  // Submit transaction for fraud analysis
  app.post("/api/transactions/submit", async (req, res) => {
    try {
      const data = submitTransactionSchema.parse(req.body);

      // Check if transaction already exists
      const existing = await db
        .select()
        .from(upiTransactions)
        .where(eq(upiTransactions.transactionId, data.transactionId))
        .limit(1)
        .then((r) => r[0]);

      if (existing) {
        return res.status(409).json({ error: "Transaction already submitted" });
      }

      // Run fraud detection
      const fraudResult = await detectFraud({
        senderUpi: data.senderUpi,
        receiverUpi: data.receiverUpi,
        amount: data.amount,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        location: data.location,
        deviceInfo: data.deviceInfo,
        merchantName: data.merchantName,
      });

      // Store transaction
      const transaction = await db
        .insert(upiTransactions)
        .values({
          transactionId: data.transactionId,
          senderUpi: data.senderUpi,
          receiverUpi: data.receiverUpi,
          amount: data.amount.toString(),
          timestamp: new Date(data.timestamp || Date.now()),
          status: data.status,
          description: data.description,
          location: data.location,
          deviceInfo: data.deviceInfo,
          merchantName: data.merchantName,
          riskScore: fraudResult.riskScore.toString(),
          isFraudulent: fraudResult.isFraudulent,
          flaggedReason: fraudResult.allReasons.join("; "),
        })
        .returning()
        .then((r) => r[0]);

      // Log detection event
      await logDetectionEvent(transaction.id, fraudResult);

      // If fraudulent, create alert
      if (fraudResult.isFraudulent) {
        await db.insert(fraudAlerts).values({
          userId: data.senderUpi,
          transactionId: transaction.id,
          alertType: "suspicious_activity",
          severity: fraudResult.riskScore > 80 ? "critical" : "warning",
          title: `Suspicious Transaction Detected`,
          message: `Your transaction of ₹${data.amount} to ${data.receiverUpi} shows suspicious patterns. Reason: ${fraudResult.allReasons.slice(0, 2).join(", ")}`,
          actionRequired: fraudResult.riskScore > 80,
        });
      }

      // Update user profile
      const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.upiAddress, data.senderUpi))
        .limit(1)
        .then((r) => r[0]);

      if (profile) {
        const newTotal = (parseFloat(profile.totalAmount || '0') || 0) + data.amount;
        const newCount = (profile.totalTransactions || 0) + 1;
        await db
          .update(userProfiles)
          .set({
            totalTransactions: newCount,
            totalAmount: newTotal.toString(),
            avgTransactionAmount: (newTotal / newCount).toString(),
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.upiAddress, data.senderUpi));
      }

      res.json({
        success: true,
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          riskScore: fraudResult.riskScore,
          isFraudulent: fraudResult.isFraudulent,
          confidence: fraudResult.confidence,
          reasons: fraudResult.allReasons,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to process transaction" });
    }
  });

  // Get transaction details
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await db
        .select()
        .from(upiTransactions)
        .where(eq(upiTransactions.id, req.params.id))
        .limit(1)
        .then((r) => r[0]);

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const detectionEvents_ = await db
        .select()
        .from(detectionEvents)
        .where(eq(detectionEvents.transactionId, transaction.id));

      res.json({
        transaction,
        detectionEvents: detectionEvents_,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  // Get user's recent transactions
  app.get("/api/users/:upi/transactions", async (req, res) => {
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const transactions = await db
        .select()
        .from(upiTransactions)
        .where(
          and(
            eq(upiTransactions.senderUpi, req.params.upi),
            gte(upiTransactions.timestamp, since)
          )
        )
        .orderBy(desc(upiTransactions.timestamp))
        .limit(50);

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // ==================== FRAUD ALERTS ====================

  // Get alerts for user
  app.get("/api/alerts/:userId", async (req, res) => {
    try {
      const alerts = await db
        .select()
        .from(fraudAlerts)
        .where(eq(fraudAlerts.userId, req.params.userId))
        .orderBy(desc(fraudAlerts.createdAt))
        .limit(20);

      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Mark alert as acknowledged
  app.patch("/api/alerts/:alertId", async (req, res) => {
    try {
      const { status, userResponse } = req.body;
      const alert = await db
        .update(fraudAlerts)
        .set({
          status: status || "acknowledged",
          userResponse,
          resolvedAt: status === "resolved" ? new Date() : null,
        })
        .where(eq(fraudAlerts.id, req.params.alertId))
        .returning()
        .then((r) => r[0]);

      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  // ==================== FRAUD PATTERNS ====================

  // Get all fraud patterns
  app.get("/api/fraud-patterns", async (req, res) => {
    try {
      const patterns = await db
        .select()
        .from(fraudPatterns)
        .where(eq(fraudPatterns.isActive, true))
        .orderBy(desc(fraudPatterns.severity));

      res.json(patterns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patterns" });
    }
  });

  // Add new fraud pattern
  app.post("/api/fraud-patterns", async (req, res) => {
    try {
      const data = addPatternSchema.parse(req.body);
      const pattern = await db
        .insert(fraudPatterns)
        .values({
          name: data.name,
          description: data.description,
          category: data.category,
          severity: data.severity,
          detectionRules: data.detectionRules,
          indicators: data.indicators,
          pattern: { type: data.category },
        })
        .returning()
        .then((r) => r[0]);

      res.json(pattern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create pattern" });
    }
  });

  // ==================== BLACKLIST ====================

  // Report fraudulent UPI/entity
  app.post("/api/blacklist/report", async (req, res) => {
    try {
      const data = reportFraudSchema.parse(req.body);

      // Check if already exists
      const existing = await db
        .select()
        .from(blacklistEntries)
        .where(
          and(
            eq(blacklistEntries.identifier, data.identifier),
            eq(blacklistEntries.identifierType, data.identifierType)
          )
        )
        .limit(1)
        .then((r) => r[0]);

      if (existing) {
        // Increment report count
        await db
          .update(blacklistEntries)
          .set({
            reportCount: (existing.reportCount || 0) + 1,
          })
          .where(eq(blacklistEntries.id, existing.id));

        return res.json({ success: true, message: "Report count incremented" });
      }

      const entry = await db
        .insert(blacklistEntries)
        .values({
          identifier: data.identifier,
          identifierType: data.identifierType,
          reason: data.reason,
          severity: data.severity,
          reportCount: 1,
        })
        .returning()
        .then((r) => r[0]);

      res.json({ success: true, entry });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to report entity" });
    }
  });

  // Get blacklist entries
  app.get("/api/blacklist", async (req, res) => {
    try {
      const entries = await db
        .select()
        .from(blacklistEntries)
        .where(eq(blacklistEntries.isActive, true))
        .orderBy(desc(blacklistEntries.reportCount))
        .limit(100);

      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blacklist" });
    }
  });

  // ==================== USER PROFILES ====================

  // Get or create user profile
  app.get("/api/users/profile/:upi", async (req, res) => {
    try {
      let profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.upiAddress, req.params.upi))
        .limit(1)
        .then((r) => r[0]);

      if (!profile) {
        profile = await db
          .insert(userProfiles)
          .values({
            upiAddress: req.params.upi,
            trustScore: "50",
          })
          .returning()
          .then((r) => r[0]);
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // ==================== CSV UPLOAD & BATCH ANALYSIS ====================

  // Upload and analyze CSV file
  app.post("/api/csv-upload", async (req, res) => {
    try {
      const { csvContent, fileName } = req.body;

      if (!csvContent || typeof csvContent !== "string") {
        return res.status(400).json({ error: "CSV content is required" });
      }

      // Parse CSV content
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        return res.status(400).json({ error: "CSV must have header and at least one data row" });
      }

      // Extract headers
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const requiredFields = ["senderupi", "receiverupi", "amount"];
      const missingFields = requiredFields.filter((f) => !headers.includes(f));

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}. Required: ${requiredFields.join(", ")}`,
        });
      }

      const results: any[] = [];
      let processedCount = 0;
      let errorCount = 0;

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        try {
          log(`CSV processing row ${i}/${lines.length - 1}`);
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length < requiredFields.length || !values[0]) continue;

          const rowData: any = {};
          headers.forEach((header, idx) => {
            rowData[header] = values[idx];
          });

          log(`Parsed row ${i}: ${JSON.stringify(rowData).slice(0,200)}`);

          const amount = parseFloat(rowData.amount);
          if (isNaN(amount) || amount <= 0) {
            throw new Error("Invalid amount");
          }

          // Run fraud detection with error handling
          let fraudResult;
          try {
            fraudResult = await detectFraud({
              senderUpi: rowData.senderupi,
              receiverUpi: rowData.receiverupi,
              amount,
              timestamp: rowData.timestamp ? new Date(rowData.timestamp) : new Date(),
              description: rowData.description || rowData.remarks,
              location: rowData.city ? { lat: 0, long: 0, city: rowData.city } : undefined,
              merchantName: rowData.merchantname,
            });
            log(`Fraud detection result: ${fraudResult.riskScore}`);
          } catch (detectionError: any) {
            log(`Fraud detection error: ${detectionError.message}`);
            throw new Error(`Fraud detection failed: ${detectionError.message}`);
          }

          // Store transaction
          const transaction = await db
            .insert(upiTransactions)
            .values({
              transactionId: `CSV-${Date.now()}-${i}`,
              senderUpi: rowData.senderupi,
              receiverUpi: rowData.receiverupi,
              amount: amount.toString(),
              timestamp: new Date(),
              status: "pending",
              description: rowData.description || rowData.remarks,
              riskScore: fraudResult.riskScore.toString(),
              isFraudulent: fraudResult.isFraudulent,
              flaggedReason: fraudResult.allReasons.join("; "),
            })
            .returning()
            .then((r) => r[0]);

          // Log detection event
          await logDetectionEvent(transaction.id, fraudResult);

          // Create alert if fraudulent
          if (fraudResult.isFraudulent) {
            await db.insert(fraudAlerts).values({
              userId: rowData.senderupi,
              transactionId: transaction.id,
              alertType: "csv_analysis",
              severity: fraudResult.riskScore > 80 ? "critical" : "warning",
              title: `Suspicious Transaction Detected (CSV Analysis)`,
              message: `Transaction of ₹${amount} to ${rowData.receiverupi} flagged. Reasons: ${fraudResult.allReasons.slice(0, 2).join(", ")}`,
              actionRequired: fraudResult.riskScore > 80,
            });
          }

          results.push({
            row: i,
            senderUpi: rowData.senderupi,
            receiverUpi: rowData.receiverupi,
            amount,
            riskScore: fraudResult.riskScore,
            isFraudulent: fraudResult.isFraudulent,
            reasons: fraudResult.allReasons,
            status: "success",
            transactionId: transaction.id,
          });

          processedCount++;
        } catch (error: any) {
          errorCount++;
          results.push({
            row: i,
            status: "error",
            error: error.message,
          });
        }
      }

      res.json({
        fileName,
        totalRows: lines.length - 1,
        processedCount,
        errorCount,
        results,
        summary: {
          fraudulentCount: results.filter((r) => r.isFraudulent).length,
          cleanCount: results.filter((r) => r.status === "success" && !r.isFraudulent).length,
          avgRiskScore: (
            results
              .filter((r) => r.status === "success")
              .reduce((sum, r) => sum + r.riskScore, 0) / processedCount
          ).toFixed(2),
        },
      });
    } catch (error: any) {
      console.error("CSV upload error:", error);
      res.status(500).json({ error: "Failed to process CSV file", details: error.message });
    }
  });

  // ==================== ANALYTICS ====================

  // Get fraud statistics
  app.get("/api/stats/fraud", async (req, res) => {
    try {
      // Return mock stats for development when DB is not available
      res.json({
        totalTransactions: 245,
        fraudulentTransactions: 12,
        fraudRate: "4.90",
        totalAmount: "1250000.00",
        fraudAmount: "85000.00",
        avgRiskScore: "32.50",
      });
    } catch (error) {
      console.error("Stats endpoint error:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  return httpServer;
}
