import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
  { date: "January", exp: 0 },
  { date: "dec 10", exp: 400 },
  { date: "Mar 20", exp: 600 },
  { date: "April", exp: 800 },
  { date: "May", exp: 850 },
  { date: "June", exp: 900 },
];

const chartConfig = {
  xp: { label: "xp" },
};

const XPChart = ({ data }) => {
  return (
    <Card className="bg-black/30 border-stroke-sc w-full text-white">
      <CardHeader>
        <CardTitle>XP chart</CardTitle>
      </CardHeader>

      <CardContent className="text-black">
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="exp"
              type="step"
              stroke="#31E78B"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default XPChart;
