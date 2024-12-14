import { DollarSign, TrendingUp } from "lucide-react";

export const performanceMetrics = [
  {
    label: "Total Value Locked",
    value: "$10,000,000",
    icon: DollarSign,
  },
  {
    label: "Monthly Return",
    value: "+8.5%",
    icon: TrendingUp,
  },
];

export default function PerformanceMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {performanceMetrics.map(metric => (
        <div key={metric.label} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
            <metric.icon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
}
