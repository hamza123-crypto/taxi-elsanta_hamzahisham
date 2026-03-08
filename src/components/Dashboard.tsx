import { PassengerDashboard } from "./PassengerDashboard";
import { DriverDashboard } from "./DriverDashboard";
import { AdminDashboard } from "./AdminDashboard";

interface DashboardProps {
  user: {
    profile: {
      role: "passenger" | "driver" | "admin";
      name: string;
    } | null;
  };
}

export function Dashboard({ user }: DashboardProps) {
  if (!user.profile) {
    return <div>Loading profile...</div>;
  }

  const { role, name } = user.profile;

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          مرحباً، {name}
        </h1>
        <p className="text-gray-600">
          {role === "passenger" && "يمكنك طلب رحلة جديدة"}
          {role === "driver" && "استقبل طلبات الرحلات"}
          {role === "admin" && "لوحة تحكم الإدارة"}
        </p>
      </div>

      {role === "passenger" && <PassengerDashboard />}
      {role === "driver" && <DriverDashboard />}
      {role === "admin" && <AdminDashboard />}
    </div>
  );
}
