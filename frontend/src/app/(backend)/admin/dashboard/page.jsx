// app/page.jsx
"use client";
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { BarChartType } from "@/components/bar-chart-type"
import useOrderSocket from "@/hooks/useOrderSocket"

export default function DashboardPage() {
  useOrderSocket();
  return ( 
    <>
      <SectionCards />
        {/* Dua BarChartType sejajar */}
      <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <BarChartType />
        </div>
        <div className="w-full">
          <BarChartType />
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable/>
    </>
  )
}
