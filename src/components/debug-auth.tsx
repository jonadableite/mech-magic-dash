"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugAuth() {
  const { user, isLoading, isAuthenticated, isInitialized } = useAuth();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Debug - Estado de Autenticação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><strong>isLoading:</strong> {isLoading.toString()}</p>
          <p><strong>isAuthenticated:</strong> {isAuthenticated.toString()}</p>
          <p><strong>isInitialized:</strong> {isInitialized.toString()}</p>
          <p><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : "null"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

