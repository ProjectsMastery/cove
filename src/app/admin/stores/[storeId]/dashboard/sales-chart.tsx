// src/app/admin/stores/[storeId]/dashboard/sales-chart.tsx
"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react"

// For now, we will use mock data to build the UI.
// Later, we will fetch this from our new 'daily_analytics' table.
const MOCK_ANALYTICS_DATA = [
  { date: "2024-07-01", sales: 222 },
  { date: "2024-07-02", sales: 180 },
  { date: "2024-07-03", sales: 290 },
  { date: "2024-07-04", sales: 250 },
  { date: "2024-07-05", sales: 310 },
  { date: "2024-07-06", sales: 340 },
  { date: "2024-07-07", sales: 290 },
  { date: "2024-07-08", sales: 410 },
  { date: "2024-07-09", sales: 380 },
  { date: "2024-07-10", sales: 450 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function SalesChart() {
  const formattedData = useMemo(() => {
    return MOCK_ANALYTICS_DATA.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Revenue Overview</CardTitle>
        <CardDescription>Your total sales over the last 10 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                {/* This creates the beautiful gradient fill */}
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: '3 3' }}
                content={<ChartTooltipContent />}
              />
              <Area 
                type="monotone" // This creates the smooth curves
                dataKey="sales" 
                stroke="var(--color-sales)"
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSales)" // Apply the gradient
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}