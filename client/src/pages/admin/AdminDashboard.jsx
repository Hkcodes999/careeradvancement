import { useState, useEffect } from "react";
import { getMyInstitution } from "../../services/institutionApi";

import AdminSidebar from "./components/AdminSidebar";
import DashboardTab from "./components/DashboardTab";
import InstitutionTab from "./components/InstitutionTab";
import BatchTab from "./components/BatchTab";
import AssignTab from "./components/AssignTab";
import UsersTab from "./components/UsersTab";
import AiBuilderTab from "./components/AiBuilderTab";
import GlobalLoader from "../../components/GlobalLoader";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state for persistence

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const res = await getMyInstitution();
        setInstitution(res.institution);
      } catch (err) {
        console.error("Dashboard Load Error:", err.message);
        // Handle case where admin hasn't created an institution yet
        setInstitution(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const renderTab = () => {
    // Optional: Show a spinner while loading to maintain UI consistency on refresh
    if (loading) {
      return <GlobalLoader />;
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab setActiveTab={setActiveTab} institution={institution} />
        );
      case "institution":
        return (
          <InstitutionTab
            institution={institution}
            setInstitution={setInstitution}
          />
        );
      case "batch":
        return <BatchTab institution={institution} />;
      case "assign":
        return <AssignTab />;
      case "users":
        return <UsersTab />;
      case "ai":
        return <AiBuilderTab institution={institution} />;
      default:
        return (
          <DashboardTab setActiveTab={setActiveTab} institution={institution} />
        );
    }
  };

  return (
    <div className="relative flex min-h-screen bg-surface dark:bg-[#00171F] font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007EA7]/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-[#00A8E8]/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100"></div>

        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 hidden md:block">
          <svg
            className="absolute w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dashboard-grid"
                w="40"
                h="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-black/[0.1] dark:text-white/20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex w-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 md:p-10 md:ml-72 max-w-7xl mx-auto w-full pt-[40px] md:pt-10">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
