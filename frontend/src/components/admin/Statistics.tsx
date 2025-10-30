import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, TrendingUp, Database } from "lucide-react";

const Statistics = () => {
  const stats = [
    {
      title: "Total Documents",
      value: "1,234",
      change: "+12%",
      icon: <FileText className="w-5 h-5" />,
      color: "from-purple-500 to-blue-500",
    },
    {
      title: "Total Conversations",
      value: "5,678",
      change: "+23%",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Response Rate",
      value: "98.5%",
      change: "+2.1%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-cyan-500 to-green-500",
    },
    {
      title: "Storage Used",
      value: "2.4 GB",
      change: "+5%",
      icon: <Database className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-green-400 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass border-slate-700/50">
        <CardHeader>
          <CardTitle className="gradient-text">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Document uploaded", time: "2 minutes ago", type: "success" },
              { action: "New conversation started", time: "15 minutes ago", type: "info" },
              { action: "Knowledge base updated", time: "1 hour ago", type: "success" },
              { action: "System backup completed", time: "3 hours ago", type: "info" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 glass rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success" ? "bg-green-400" : "bg-blue-400"
                    }`}
                  />
                  <span className="text-sm text-white">{activity.action}</span>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
