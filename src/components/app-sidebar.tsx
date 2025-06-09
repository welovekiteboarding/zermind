"use client";

import { useState } from "react";
import { 
  Home, 
  MessageSquarePlus,
  MessageSquare,
  LogOut,
  Settings,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

// Mock chat sessions data - replace with real data fetching
const mockChatSessions = [
  {
    id: "1",
    title: "Discussion about AI ethics",
    lastMessage: "What are the implications...",
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2", 
    title: "Machine Learning Tutorial",
    lastMessage: "Can you explain neural networks...",
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    title: "Code Review Session",
    lastMessage: "Please review this React component...",
    updatedAt: new Date("2024-01-13"),
  },
];

const navigationItems = [
  {
    title: "Home",
    url: "/protected",
    icon: Home,
  },
  {
    title: "Settings",
    url: "/protected/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState(mockChatSessions);

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const createNewChat = async () => {
    try {
      // TODO: Implement actual chat creation logic
      const newChat = {
        id: Date.now().toString(),
        title: "New Chat",
        lastMessage: "",
        updatedAt: new Date(),
      };
      setChatSessions([newChat, ...chatSessions]);
      // Navigate to the new chat
      router.push(`/protected/chat/${newChat.id}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      // TODO: Implement actual chat deletion logic
      setChatSessions(chatSessions.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="p-4">
          <Button 
            onClick={createNewChat}
            className="w-full justify-start gap-2"
            size="sm"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat Sessions */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatSessions.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <a href={`/protected/chat/${chat.id}`} className="flex-1 m-2">
                      <MessageSquare className="h-4 w-4" />
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate font-medium">{chat.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(chat.updatedAt)}
                        </div>
                      </div>
                    </a>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction>
                        <MoreHorizontal className="h-4 w-4" />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem
                        onClick={() => deleteChat(chat.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="w-full">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 