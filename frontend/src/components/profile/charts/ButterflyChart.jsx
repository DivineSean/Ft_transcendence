"use client";
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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


const chartConfig = {
  progress: {
    label: "progress",
    color: "#31E78B",
  },
};

const ButterflyChart = ({ progress }) => {
  const totalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0);
  const overallProgress = (totalProgress / 400) * 100;
  const chartData = Object.keys(progress).map((key) => ({
    name: key,
    progress: Math.min(progress[key] , 100),
  }));
  console.log(chartData);
  return (
    <Card className="grow bg-black/30 border-stroke-sc text-white">
      <CardHeader className="items-center pb-4">
        <CardTitle>Achievement Progress</CardTitle>
        <CardDescription>
          Tracking your gaming achievements
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <PolarAngleAxis dataKey="name"/>

            <PolarGrid />

            <Radar
              dataKey={"progress"}
              fill={"var(--color-progress)"}
              stroke={"#31E78B"}
              strokeWidth={2}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Your Skills growth by {overallProgress.toFixed(1)}% <TrendingUp className="h-5 w-5" />
        </div>

        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {overallProgress.toFixed(0) < 30 && "Keep pushing! Every step counts towards your goal."}
          {overallProgress.toFixed(0) >= 30 && overallProgress.toFixed(0) < 50 && "You're making great progress! Keep the momentum going."}
          {overallProgress.toFixed(0) >= 50 && overallProgress.toFixed(0) < 70 && "Awesome work! You're more than halfway there."}
          {overallProgress.toFixed(0) >= 70 && overallProgress.toFixed(0) < 90 && "Fantastic effort! The finish line is within sight."}
          {overallProgress.toFixed(0) >= 90 && "You're a star achiever! be proud you reached perfection!"}
      </div>
      </CardFooter>
    </Card>
  );
};


export default ButterflyChart;
