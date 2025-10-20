import { Layout } from "@/components/layout";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Layout>{children}</Layout>
      </ProtectedRoute>
    </AuthProvider>
  );
}
