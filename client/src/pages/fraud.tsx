import React from "react";
import Layout from "@/components/layout";
import { FraudMonitoringDashboard } from "@/components/fraud-dashboard";

export default function FraudPage() {
  return (
    <Layout>
      <FraudMonitoringDashboard />
    </Layout>
  );
}
