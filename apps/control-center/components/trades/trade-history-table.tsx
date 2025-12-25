"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";

interface TradeHistoryEntry {
  request_id: string;
  trace_id?: string;
  timestamp: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  user_id: string;
  desk: string;
  recommendation?: "proceed" | "deny" | "modify" | "escalate";
  compliance_status?: "pass" | "fail" | "needs_review";
  audit_id?: string;
}

interface TradeHistoryTableProps {
  trades: TradeHistoryEntry[];
  isLoading?: boolean;
}

export function TradeHistoryTable({ trades, isLoading }: TradeHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState("all");
  const [filterRecommendation, setFilterRecommendation] = useState("all");

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch =
      searchTerm === "" ||
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.request_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSide = filterSide === "all" || trade.side === filterSide;

    const matchesRecommendation =
      filterRecommendation === "all" ||
      trade.recommendation === filterRecommendation;

    return matchesSearch && matchesSide && matchesRecommendation;
  });

  const getRecommendationBadge = (recommendation?: string) => {
    switch (recommendation) {
      case "proceed":
        return <Badge variant="success">Proceed</Badge>;
      case "deny":
        return <Badge variant="destructive">Deny</Badge>;
      case "modify":
        return <Badge variant="warning">Modify</Badge>;
      case "escalate":
        return <Badge variant="warning">Escalate</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getComplianceBadge = (status?: string) => {
    switch (status) {
      case "pass":
        return <Badge variant="success">Pass</Badge>;
      case "fail":
        return <Badge variant="destructive">Fail</Badge>;
      case "needs_review":
        return <Badge variant="warning">Review</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading trades...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter trade history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by symbol, user, or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filterSide}
              onChange={(e) => setFilterSide(e.target.value)}
            >
              <option value="all">All Sides</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </Select>

            <Select
              value={filterRecommendation}
              onChange={(e) => setFilterRecommendation(e.target.value)}
            >
              <option value="all">All Recommendations</option>
              <option value="proceed">Proceed</option>
              <option value="deny">Deny</option>
              <option value="modify">Modify</option>
              <option value="escalate">Escalate</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trade Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>
                {filteredTrades.length} trade{filteredTrades.length !== 1 ? "s" : ""}{" "}
                {filteredTrades.length !== trades.length && `(filtered from ${trades.length})`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trades found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm">
                    <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium">Side</th>
                    <th className="text-right py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Desk</th>
                    <th className="text-left py-3 px-4 font-medium">Recommendation</th>
                    <th className="text-left py-3 px-4 font-medium">Compliance</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr key={trade.request_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(trade.timestamp), "MMM dd, HH:mm:ss")}
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm font-semibold">{trade.symbol}</code>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={trade.side === "buy" ? "success" : "destructive"}
                        >
                          {trade.side.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">
                        {trade.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">{trade.user_id}</td>
                      <td className="py-3 px-4 text-sm capitalize">{trade.desk}</td>
                      <td className="py-3 px-4">
                        {getRecommendationBadge(trade.recommendation)}
                      </td>
                      <td className="py-3 px-4">
                        {getComplianceBadge(trade.compliance_status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {trade.audit_id && (
                            <Link
                              href={`/audit?trace_id=${trade.trace_id || trade.request_id}`}
                            >
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
