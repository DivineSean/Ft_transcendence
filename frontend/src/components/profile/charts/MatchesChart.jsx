"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
const chartData = [
  { browser: "safari", visitors: 200, fill: "#31E78B" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
}

const MatchesChart = () => {
  return (
    <Card className="flex flex-col bg-black/30 border-stroke-sc text-white grow">
      <CardHeader className="items-center pb-0">
        <CardTitle>Radial Chart - Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>

      <CardContent className="pb-0 flex flex-col justify-center items-center grow">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[250px] h-[250px] text-gray"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={320}
            innerRadius={80}
            outerRadius={110}
						className=""
          >

            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={[86, 74]}
            />

            <RadialBar dataKey="visitors" background cornerRadius={10} />

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

                          {chartData[0].visitors.toLocaleString()}

                        </tspan>

                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-gray/80"
                        >

                          matches

                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  )
}

export default MatchesChart;