"use client";

import { useEffect, useState } from "react";
import { HealthStatusCard } from "@/components/dashboard/health-status-card";
import { orchestratorClient, auditClient, riskClient } from "@/lib/api";
import { HealthResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [orchestratorHealth, setOrchestratorHealth] =
    useState<HealthResponse | null>(null);
  const [auditHealth, setAuditHealth] = useState<HealthResponse | null>(null);
  const [riskHealth, setRiskHealth] = useState<HealthResponse | null>(null);

  const [orchestratorError, setOrchestratorError] = useState<Error | null>(
    null
  );
  const [auditError, setAuditError] = useState<Error | null>(null);
  const [riskError, setRiskError] = useState<Error | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      setIsLoading(true);

      // Fetch orchestrator health
      try {
        const health = await orchestratorClient.getHealth();
        setOrchestratorHealth(health);
        setOrchestratorError(null);
      } catch (error) {
        setOrchestratorError(
          error instanceof Error ? error : new Error("Unknown error")
        );
      }

      // Fetch audit-mcp health
      try {
        const health = await auditClient.getHealth();
        setAuditHealth(health);
        setAuditError(null);
      } catch (error) {
        setAuditError(
          error instanceof Error ? error : new Error("Unknown error")
        );
      }

      // Fetch risk-mcp health
      try {
        const health = await riskClient.getHealth();
        setRiskHealth(health);
        setRiskError(null);
      } catch (error) {
        setRiskError(
          error instanceof Error ? error : new Error("Unknown error")
        );
      }

      setIsLoading(false);
    };

    fetchHealthStatus();

    // Refresh health status every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor the health and status of all services
        </p>
      </div>

      {/* Service Health Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <HealthStatusCard
          title="Orchestrator"
          health={orchestratorHealth}
          isLoading={isLoading}
          error={orchestratorError}
        />
        <HealthStatusCard
          title="Audit MCP"
          health={auditHealth}
          isLoading={isLoading}
          error={auditError}
        />
        <HealthStatusCard
          title="Risk MCP"
          health={riskHealth}
          isLoading={isLoading}
          error={riskError}
        />
      </div>

      {/* Placeholder cards for future metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Policy Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
