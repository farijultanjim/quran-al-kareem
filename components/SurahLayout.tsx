// "use client";

// import { useState } from "react";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import Header from "@/components/Header";
// import { SurahSidebar } from "@/components/SurahSidebar";
// import { SettingsSidebar } from "@/components/SettingsSidebar";
// import { SettingsSheet } from "@/components/SettingsSheet";

// interface SurahLayoutProps {
//   children: React.ReactNode;
// }

// export function SurahLayout({ children }: SurahLayoutProps) {
//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header - Fixed at top */}


//       {/* Sidebars + Main Content */}
//       <SidebarProvider>
//         {/* Left Sidebar - Surahs */}
//         <SurahSidebar />

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">{children}</main>

//         {/* Right Sidebar - Settings */}
//         <SettingsSidebar />
//       </SidebarProvider>

//       {/* Settings Sheet for Mobile */}
//       <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
//     </div>
//   );
// }
