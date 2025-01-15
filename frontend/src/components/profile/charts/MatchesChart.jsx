"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  matches: {
    label: "Total Games",
    color: "hsl(var(--chart-2))",
  },
};

const MatchesChart = ({ totalgames, winrate }) => {
  const endAngle = 360 * (winrate / 100);

  const chartData = [
    {
      matches: totalgames,
      fill: "#31E78B",
    },
  ];
  return (
    <Card className="flex flex-col bg-black/30 border-stroke-sc text-white grow">
      <CardHeader className="items-center pb-0">
        <CardTitle>Matches Performance</CardTitle>
        <CardDescription>Winrate Overview</CardDescription>
      </CardHeader>

      <CardContent className="pb-0 flex flex-col justify-center items-center grow">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[250px] h-[250px] text-gray"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={110}
            barSize={10} //zedt hadi a driss jatni hsen
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="matches" background cornerRadius={10} />

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold fill-white"
                        >
                          {winrate.toFixed(1)}%
                        </tspan>

                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-gray/80"
                        >
                          {totalgames} matches
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          {winrate > 50
            ? "You're doing great! Keep it up!"
            : "Keep practicing to improve your win rate!"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MatchesChart;
