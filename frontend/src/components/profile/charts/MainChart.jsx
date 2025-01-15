import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  rating: {
    label: "MMR",
    color: "hsl(var(--chart-1))",
  },
};

  //testing case-------------------------------------------------------------
  // const sampleRatingHistory = Array.from({ length: 30 }, (_, index) => {
  //   const date = new Date();
  //   date.setDate(date.getDate() - (29 - index)); // Last 30 days
    
  //   // Simulate realistic MMR changes
  //   const baseRating = 1000;
  //   const variation = Math.sin(index * 0.5) * 100; // Creates a wave pattern
  //   const randomness = (Math.random() - 0.5) * 50; // Adds some randomness
  //   const rating = Math.round(baseRating + variation + randomness);
    
  //   return {
  //     timestamp: date.toISOString(),
  //     rating: Math.max(0, rating), // Ensure rating doesn't go below 0
  //   };
  // });

  // const MainChart = ({ ratingHistory = sampleRatingHistory }) => {
  // ------------------------------------------------------------------------

  const MainChart = ({ ratingHistory = []}) => {
  const chartData = ratingHistory.map(data => (
  {
    month: new Date(data.timestamp).toLocaleDateString(),
    rating: data.rating,
  }));

  return (
    <Card className="bg-black/30 border-stroke-sc w-full text-white">
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Line
              dataKey="rating"
              type="natural"
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

export default MainChart;