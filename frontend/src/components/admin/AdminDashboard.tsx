import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, FileText, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "./FileUpload";
import TextInput from "./TextInput";
import Statistics from "./Statistics";

interface AdminDashboardProps {
  onNavigateToChat: () => void;
}

const AdminDashboard = ({ onNavigateToChat }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-slate-700/50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={onNavigateToChat}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center glow-purple">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold gradient-text">Admin Dashboard</h1>
              </div>
            </div>

            <div className="text-sm text-slate-400">Manage your AI knowledge base</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass border border-slate-700/50">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>File Upload</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Text Input</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Statistics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card className="glass border-slate-700/50">
                <CardHeader>
                  <CardTitle className="gradient-text">Upload Files</CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload documents to enhance your AI's knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="space-y-6">
              <Card className="glass border-slate-700/50">
                <CardHeader>
                  <CardTitle className="gradient-text">Add Text Data</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manually add text content to your knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TextInput />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <Statistics />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
