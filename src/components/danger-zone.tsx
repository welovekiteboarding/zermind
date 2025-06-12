"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Download,
  Trash2,
  Shield,
  Database,
  MessageSquare,
  Key,
  BarChart3,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  useDeleteAccount, 
  useExportData, 
  useAccountStats 
} from "@/hooks/use-account";

interface DeleteFormData {
  confirmation: string;
}

interface DangerZoneProps {
  className?: string;
}

export function DangerZone({ className }: DangerZoneProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // React Query hooks
  const { data: stats, isLoading: statsLoading } = useAccountStats();
  const deleteAccountMutation = useDeleteAccount();
  const exportDataMutation = useExportData();

  // Form for delete confirmation
  const deleteForm = useForm<DeleteFormData>({
    defaultValues: {
      confirmation: "",
    },
  });

  const handleExportData = async () => {
    try {
      await exportDataMutation.mutateAsync();
      toast.success("Data export started! Your download should begin shortly.");
      setIsExportDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export data");
    }
  };

  const handleDeleteAccount = async (data: DeleteFormData) => {
    // Validate that the confirmation text is correct
    if (data.confirmation !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' exactly to confirm");
      return;
    }

    try {
      const result = await deleteAccountMutation.mutateAsync({ 
        confirmation: "DELETE MY ACCOUNT" 
      });
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      // The useDeleteAccount hook handles redirection
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <Card className={`border-destructive/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
      <Alert className="border-destructive/50 bg-destructive/10">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Think carefully!</strong> Actions in this section are permanent and cannot be undone.
            We recommend exporting your data before making any irreversible changes.
          </AlertDescription>
        </Alert>

        {/* Account Statistics */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{formatNumber(stats.chats)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Chats</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{formatNumber(stats.messages)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Key className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{formatNumber(stats.apiKeys)}</span>
              </div>
              <p className="text-xs text-muted-foreground">API Keys</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{formatNumber(stats.usageLogs)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Usage Logs</p>
            </div>
          </div>
        )}

        {/* Export Data Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a copy of all your data before deletion
              </p>
            </div>
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Your Data</DialogTitle>
                  <DialogDescription>
                    This will download a JSON file containing all your chats, messages, 
                    API key metadata (not the actual keys), and usage statistics.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <Download className="h-4 w-4" />
                    <AlertDescription>
                      The exported file will be named with today&apos;s date and can be used 
                      to backup your data or import it elsewhere.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsExportDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleExportData}
                    disabled={exportDataMutation.isPending}
                  >
                    {exportDataMutation.isPending ? "Exporting..." : "Download Export"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="space-y-3 pt-4 border-t border-destructive/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your 
                    account and remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>This will permanently delete:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• All your chats and conversations</li>
                        <li>• All your API keys (securely)</li>
                        <li>• All your usage history and analytics</li>
                        <li>• Your account and profile information</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Type <Badge variant="destructive" className="mx-1">DELETE MY ACCOUNT</Badge> to confirm:
                      </label>
                      <Input
                        {...deleteForm.register("confirmation")}
                        placeholder="DELETE MY ACCOUNT"
                        className="mt-2"
                      />
                      {deleteForm.formState.errors.confirmation && (
                        <p className="text-sm text-destructive mt-1">
                          {deleteForm.formState.errors.confirmation.message}
                        </p>
                      )}
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => {
                          setIsDeleteDialogOpen(false);
                          deleteForm.reset();
                        }}
                        disabled={deleteAccountMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        variant="destructive"
                        disabled={
                          deleteAccountMutation.isPending || 
                          !deleteForm.watch("confirmation") ||
                          deleteForm.watch("confirmation") !== "DELETE MY ACCOUNT"
                        }
                      >
                        {deleteAccountMutation.isPending ? "Deleting..." : "Delete My Account"}
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>What happens when you delete your account:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Your account will be immediately deactivated</li>
                <li>• All data will be permanently removed from our servers</li>
                <li>• Shared chat links will stop working</li>
                <li>• This action cannot be reversed</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
} 