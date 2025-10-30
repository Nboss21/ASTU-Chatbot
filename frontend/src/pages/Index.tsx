import { useState } from "react";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<"chat" | "admin">("chat");

  return (
    <div className="min-h-screen">
      {currentView === "chat" ? (
        <ChatInterface onNavigateToAdmin={() => setCurrentView("admin")} />
      ) : (
        <AdminDashboard onNavigateToChat={() => setCurrentView("chat")} />
      )}
    </div>
  );
};

export default Index;
