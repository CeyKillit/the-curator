"use client";

import { useCurator } from "@/app/contexts/curator-context";
import { AnalyticsOverviewScreen } from "@/app/components/curator/screens-core";

export default function AnalyticsPage() {
  const { overview, docs } = useCurator();
  return <AnalyticsOverviewScreen overview={overview} docs={docs} />;
}
