import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";
import BottomSheet from "@/components/BottomSheet";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";

const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const views = [12000, 18000, 15000, 22000, 26000, 31000, 29500, 34000];
const audience = [8400, 8800, 9100, 9600, 10100, 10750, 11200, 11800];

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

export default function ChannelAnalyticsCard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("views");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const viewsData = useMemo(
    () => months.map((month, index) => ({ month, views: views[index] ?? 0 })),
    []
  );
  const audienceData = useMemo(
    () => months.map((month, index) => ({ month, audience: audience[index] ?? 0 })),
    []
  );

  const lastMonthViews = views[views.length - 1] ?? 0;
  const avg6 = Math.round(average(views.slice(-6)));
  const currentSubs = audience[audience.length - 1] ?? 0;
  const netChange6 =
    audience.length >= 7
      ? currentSubs - (audience[audience.length - 7] ?? currentSubs)
      : 0;

  const chartConfig = {
    views: { label: "Views", color: "hsl(var(--primary))" },
    audience: { label: "Audience", color: "hsl(var(--primary))" },
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">Analytics</h3>
              <button
                type="button"
                onClick={() => setIsInfoOpen(true)}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground"
                aria-label="Analytics info"
              >
                <Info size={14} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Demo / Mock data</p>
          </div>
          <TabsList className="grid h-8 w-40 grid-cols-2">
            <TabsTrigger className="text-xs" value="views">
              Views
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="audience">
              Audience
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="views" className="mt-0">
          <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
            <LineChart data={viewsData} margin={{ top: 8, left: 0, right: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <Tooltip
                cursor={{ strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatNumber(Number(value), language)}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                strokeWidth={2}
                dot={{ r: 2, fill: "var(--color-views)" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
          <div className="mt-3 border-t border-border/50 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Last month</p>
                <p className="text-sm font-semibold text-primary">
                  {formatNumber(lastMonthViews, language)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">6-month avg</p>
                <p className="text-sm font-semibold text-primary">
                  {formatNumber(avg6, language)}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="audience" className="mt-0">
          <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
            <LineChart
              data={audienceData}
              margin={{ top: 8, left: 0, right: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <Tooltip
                cursor={{ strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatNumber(Number(value), language)}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="audience"
                stroke="var(--color-audience)"
                strokeWidth={2}
                dot={{ r: 2, fill: "var(--color-audience)" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
          <div className="mt-3 border-t border-border/50 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Current</p>
                <p className="text-sm font-semibold text-primary">
                  {formatNumber(currentSubs, language)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Net change (6 mo)</p>
                <p className="text-sm font-semibold text-primary">
                  {formatNumber(netChange6, language)}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <BottomSheet
        open={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        title="Analytics"
      >
        <p className="text-sm text-muted-foreground">
          This is demo analytics. Real charts will appear after we collect enough data.
        </p>
      </BottomSheet>
    </div>
  );
}
