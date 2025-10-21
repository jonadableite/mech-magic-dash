import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TourProvider } from "@/contexts/tour-context";
import { TourGuide } from "@/components/tour/tour-guide";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TourProvider>
          <Layout>
            {children}
            <TourGuide />
          </Layout>
        </TourProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}
