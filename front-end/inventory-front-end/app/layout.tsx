'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { NavLink } from "@/components/NavLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else if (pathname !== '/authentication') {
      // Redirect to login if not authenticated and not already on login page
      router.push('/authentication');
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/authentication');
  };

  // Show login page without navbar/sidebar
  if (pathname === '/authentication' || !isAuthenticated) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    );
  }

  if (loading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <div className="flex items-center justify-center h-screen">
            <p className="text-lg">Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Top Navigation - Responsive positioning */}
        <nav className="fixed top-2 left-[calc(4rem+5px)] md:left-[calc(5rem+5px)] lg:left-[calc(16rem+5px)] right-2 h-[66px] w-auto border-b bg-white z-40 rounded-2xl transition-all duration-300 ml-0 shadow-md"
          style={{ marginLeft: '5px', marginRight: '5px' }}>
          <div className="px-2 sm:px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-black">
                Hello, Welcome to IMS, <span className="text-[#1E6640]">{user?.username || 'User'}</span>!
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <SearchBar />
              <Button variant="ghost" size="icon" className="hover:bg-[#0B2B1A] group h-8 w-8 sm:h-10 sm:w-10">
          {/* Darkmode */}
          <img src="/darkmodeIcon.png" alt="#" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:brightness-0 group-hover:invert" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-[#0B2B1A] group h-8 w-8 sm:h-10 sm:w-10">
          {/* Notifications */}
          <img src="/notif.png" alt="#" className="w-4 h-4 sm:w-5 sm:h-5 group-hover:brightness-0 group-hover:invert" />
              </Button>
              <Button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                Logout
              </Button>
            </div>
          </div>
        </nav>
        
        {/* Sidebar - Collapses to icon-only on small/medium screens, full width on large screens */}
        <aside className="fixed left-2 top-2 pb-4 mb-[10px] h-[calc(100vh-20px)] w-16 md:w-20 lg:w-64 bg-[#323232] z-50 transition-all duration-300 rounded-2xl">
            <nav className="flex flex-col gap-2 p-2 lg:p-4">
              <div className="bg-gradient-to-r from-[#0B2B1A] to-[#1E6640] h-[66px] flex items-center justify-center fixed top-2 left-2 w-16 md:w-20 lg:w-64 rounded-t-2xl z-50"
              style={{ clipPath: "inset(0 round 1rem 1rem 0 0)" }}>
              <h1 className="text-white text-xs lg:text-sm font-bold hidden lg:block">Inventory Management System</h1>
              <h1 className="text-white text-xs font-bold lg:hidden">IMS</h1>
              </div>
            <div className="flex flex-col items-center gap-2 mt-20">
          <div className="w-10 h-10 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-white shadow-lg">
          <img src="/PlaceholderPic.jpg" alt="Profile" />
          </div>
              <span className="text-white text-[10px] lg:text-sm font-medium text-center px-1 lg:px-2 hidden lg:block">
                {user?.username?.toUpperCase() || 'USER'}
              </span>
              <h4 className="text-white text-xs hidden lg:block">{user?.role || 'Employee'}</h4>
            </div>

              <NavLink href="/" icon="/Home.png" label="Dashboard" />
              <NavLink href="/Users_Management" icon="/user.png" label="Management" />
              <NavLink href="/inventory" icon="/inventory.png" label="Inventory" />
              <NavLink href="/Sale" icon="/Icon (1).png" label="Sales Orders" />

            {/* Sidebar navigation items go here */}
          </nav>
        </aside>
        
        {/* Main content - Responsive margin */}
        <main className="ml-16 md:ml-20 lg:ml-64 mt-[66px] p-2 sm:p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
