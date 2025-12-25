"use client";

import { TradeRecommendationResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";

interface TradeRecommendationResultProps {
  response: TradeRecommendationResponse;
}

export function TradeRecommendationResult({
  response,
}: TradeRecommendationResultProps) {
  const getRecommendationIcon = () => {
    switch (response.recommendation) {
      case "proceed":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "deny":
        return <XCircle className="h-6 w-6 text-destructive" />;
      case "modify":
      case "escalate":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertCircle className="h-6 w-6" />;
    }
  };

  const getRecommendationBadge = () => {
    switch (response.recommendation) {
      case "proceed":
        return <Badge variant="success">Proceed</Badge>;
      case "deny":
        return <Badge variant="destructive">Deny</Badge>;
      case "modify":
        return <Badge variant="warning">Modify</Badge>;
      case "escalate":
        return <Badge variant="warning">Escalate</Badge>;
      default:
        return <Badge>{response.recommendation}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getComplianceBadge = () => {
    switch (response.compliance.status) {
      case "pass":
        return <Badge variant="success">Pass</Badge>;
      case "fail":
        return <Badge variant="destructive">Fail</Badge>;
      case "needs_review":
        return <Badge variant="warning">Needs Review</Badge>;
      default:
        return <Badge>{response.compliance.status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Recommendation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRecommendationIcon()}
              <CardTitle>Recommendation</CardTitle>
            </div>
            {getRecommendationBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Rationale</h4>
            <p className="text-sm text-muted-foreground">{response.rationale}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Confidence</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${response.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {(response.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Audit ID</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {response.audit_id}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compliance</CardTitle>
            {getComplianceBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {response.compliance.policy_refs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Policy References</h4>
              <div className="flex flex-wrap gap-2">
                {response.compliance.policy_refs.map((ref, i) => (
                  <Badge key={i} variant="outline">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {response.compliance.evidence_refs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Evidence References</h4>
              <div className="flex flex-wrap gap-2">
                {response.compliance.evidence_refs.map((ref, i) => (
                  <Badge key={i} variant="outline">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Flags */}
      {response.risk_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Flags ({response.risk_flags.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {response.risk_flags.map((flag, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <AlertCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{flag.type}</span>
                      {getSeverityBadge(flag.severity)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Evidence: {flag.evidence_ref}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modified Trade (if applicable) */}
      {response.modified_trade && (
        <Card>
          <CardHeader>
            <CardTitle>Modified Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm text-muted-foreground">Symbol:</span>
                <span className="ml-2 font-medium">
                  {response.modified_trade.symbol}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Side:</span>
                <span className="ml-2 font-medium capitalize">
                  {response.modified_trade.side}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <span className="ml-2 font-medium">
                  {response.modified_trade.quantity}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Order Type:</span>
                <span className="ml-2 font-medium capitalize">
                  {response.modified_trade.order_type}
                </span>
              </div>
              {response.modified_trade.limit_price && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Limit Price:
                  </span>
                  <span className="ml-2 font-medium">
                    ${response.modified_trade.limit_price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {response.next_steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {response.next_steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
