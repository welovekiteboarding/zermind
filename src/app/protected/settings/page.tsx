import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiKeyManagement } from "@/components/api-key-management";
import { DangerZone } from "@/components/danger-zone";
import { User, Settings, Shield, Database } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and privacy settings
        </p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                {data?.user?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md truncate">
                {data?.user?.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Account Created
              </label>
              <p className="text-sm bg-muted px-3 py-2 rounded-md">
                {data?.user?.created_at
                  ? new Date(data.user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email Verified
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    data?.user?.email_confirmed_at ? "secondary" : "destructive"
                  }
                >
                  {data?.user?.email_confirmed_at ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Chat Preferences & API Keys
          </CardTitle>
          <CardDescription>
            Customize your chat experience and manage your API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Management */}
          <ApiKeyManagement />

          {/* Other Chat Preferences */}
          <div className="pt-6 border-t">
            <h4 className="font-medium mb-3">
              Other Preferences{" "}
              <Badge variant="secondary" className="text-sm">
                Soon
              </Badge>
            </h4>
            <div className="text-sm text-muted-foreground">
              Additional chat preferences will be implemented in future updates.
              This will include:
            </div>
            <ul className="text-sm space-y-2 ml-4 mt-2">
              <li>• Default AI model selection</li>
              <li>• Message history settings</li>
              <li>• Notification preferences</li>
              <li>• Theme customization</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
            <Badge variant="secondary" className="text-sm">
              Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            Control your data and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Privacy controls will be implemented in future updates. This will
            include:
          </div>
          <ul className="text-sm space-y-2 ml-4">
            <li>• Two-factor authentication</li>
            <li>• Session management</li>
            <li>• Privacy preferences</li>
            <li>• Security audit logs</li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
            <Badge variant="secondary" className="text-sm">
              Soon
            </Badge>
          </CardTitle>
          <CardDescription>Manage your chat data and storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Data management features will be implemented in future updates. This
            will include:
          </div>
          <ul className="text-sm space-y-2 ml-4">
            <li>• Bulk message deletion</li>
            <li>• Storage usage analytics</li>
            <li>• Data retention settings</li>
            <li>• Automatic cleanup rules</li>
          </ul>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <DangerZone />
    </div>
  );
}
