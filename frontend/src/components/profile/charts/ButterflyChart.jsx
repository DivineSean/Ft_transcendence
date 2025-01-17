import { LuTrendingUp } from "react-icons/lu";
import {
  PolarRadiusAxis,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const ChartTooltipContent = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { label, progress } = payload[0].payload;
    return (
      <div className="bg-white p-8 text-black/70 rounded-lg border border-stroke-sc flex flex-col gap-4">
        <p className="font-bold">{label}</p>
        <div className="flex gap-8 items-center">
          <span className="h-10 w-10 rounded-[2px] bg-green"></span>
          <p>Progress: {Math.min((progress / 189) * 100, 100).toFixed(1)}%</p>
        </div>
      </div>
    );
  }
  return null;
};

const ButterflyChart = ({ progress }) => {
  const totalProgress = Object.values(progress).reduce(
    (sum, value) => sum + value,
    0,
  );
  const overallProgress = (totalProgress / 400) * 100;
  const oProgress = overallProgress.toFixed(0);

  const chartData = Object.keys(progress).map((key) => ({
    label: key,
    progress: Math.min((progress[key] / 189) * 100, 100).toFixed(0),
  }));

  return (
    <Card className="grow bg-black/30 border-stroke-sc text-white">
      <CardHeader className="items-center pb-4">
        <CardTitle>Achievement Progress</CardTitle>
        <CardDescription>Tracking your gaming achievements</CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer
          config={chartData}
          className="mx-auto aspect-square max-h-[250px] !w-full"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis domain={[0, 100]} tick={false} />
            <PolarGrid />
            <Radar
              dataKey={"progress"}
              fill={"#31E78B"}
              stroke={"#31E78B"}
              strokeWidth={2}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Your Skills growth by {overallProgress.toFixed(1)}%{" "}
          <LuTrendingUp className="h-5 w-5" />
        </div>

        <div className="flex text-center gap-2 text-stroke-sc">
          {oProgress < 30 &&
            "Keep pushing! Every step counts towards your goal."}
          {oProgress >= 30 &&
            oProgress < 50 &&
            "You're making great progress! Keep the momentum going."}
          {oProgress >= 50 &&
            oProgress < 70 &&
            "Awesome work! You're more than halfway there."}
          {oProgress >= 70 &&
            oProgress < 90 &&
            "Fantastic effort! The finish line is within sight."}
          {oProgress >= 90 &&
            "You're a star achiever! Be proud you reached perfection!"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ButterflyChart;
