"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { HealthResponse } from "@/lib/types";

interface HealthStatusCardProps {
  title: string;
  health: HealthResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

export function HealthStatusCard({
  title,
  health,
  isLoading,
  error,
}: HealthStatusCardProps) {
  const getStatusIcon = () => {
    if (isLoading) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    if (error || !health) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (health.status === "ok") {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return <Badge variant="warning">Loading...</Badge>;
    }
    if (error || !health) {
      return <Badge variant="destructive">Offline</Badge>;
    }
    if (health.status === "ok") {
      return <Badge variant="success">Online</Badge>;
    }
    return <Badge variant="warning">Unknown</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          {health && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Version: {health.version}
              </p>
              <p className="text-xs text-muted-foreground">
                Env: {health.env}
              </p>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-xs text-destructive">{error.message}</p>
        )}
        {health?.hash_chain !== undefined && (
          <p className="mt-2 text-xs text-muted-foreground">
            Hash Chain: {health.hash_chain ? "Enabled" : "Disabled"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
