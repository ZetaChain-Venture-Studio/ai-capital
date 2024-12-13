import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const mockPortfolio = [
  {
    token: 'Bitcoin',
    symbol: 'BTC',
    amount: '2.5',
    value: 125000,
    change: 5.2,
  },
  {
    token: 'Ethereum',
    symbol: 'ETH',
    amount: '45.8',
    value: 85000,
    change: -2.1,
  },
  {
    token: 'Dogecoin',
    symbol: 'DOGE',
    amount: '150000',
    value: 15000,
    change: 12.4,
  },
];

const performanceMetrics = [
  {
    label: 'Total Value Locked',
    value: '$10,000,000',
    icon: DollarSign,
  },
  {
    label: 'Monthly Return',
    value: '+8.5%',
    icon: TrendingUp,
  },
];

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Portfolio</h1>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {performanceMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                </div>
                <metric.icon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Holdings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPortfolio.map((item) => (
                <tr key={item.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.token}
                        </div>
                        <div className="text-sm text-gray-500">{item.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${item.value.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`flex items-center text-sm ${
                        item.change >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {item.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(item.change)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}