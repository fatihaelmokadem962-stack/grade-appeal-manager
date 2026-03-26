import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/AppLayout";
import StudentDashboard from "@/components/student/StudentDashboard";
import NewComplaintForm from "@/components/student/NewComplaintForm";
import MyComplaints from "@/components/student/MyComplaints";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";
import TeacherComplaints from "@/components/teacher/TeacherComplaints";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ManageStudents from "@/components/admin/ManageStudents";
import ManageTeachers from "@/components/admin/ManageTeachers";
import ManageSubjects from "@/components/admin/ManageSubjects";
import AllComplaints from "@/components/admin/AllComplaints";

export default function Index() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user) return <LoginPage />;

  const renderContent = () => {
    if (user.role === "student") {
      switch (activeTab) {
        case "new-complaint": return <NewComplaintForm />;
        case "my-complaints": return <MyComplaints />;
        default: return <StudentDashboard />;
      }
    }
    if (user.role === "teacher") {
      switch (activeTab) {
        case "complaints": return <TeacherComplaints />;
        default: return <TeacherDashboard />;
      }
    }
    // admin
    switch (activeTab) {
      case "students": return <ManageStudents />;
      case "teachers": return <ManageTeachers />;
      case "subjects": return <ManageSubjects />;
      case "all-complaints": return <AllComplaints />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
}
