import ClientProviders from "@/components/ClientProviders";
import ClientLayout from "@/components/layouts/ClientLayout";
import { Poppins } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./helper/ReactQueryProvider";
import ReduxProvider from "./helper/ReduxProvider";
import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Asset Management - AMD",
  description: "Asset Management Dashboard",
  icons: {
    icon: "/favicon.ico",
  },
};

function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <ReduxProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <ThemeProvider>
                  <ClientProviders>
                    <ClientLayout>
                      {children}
                    </ClientLayout>
                    <Toaster 
                      position="top-right" 
                      richColors 
                      expand={false}
                      closeButton
                    />
                  </ClientProviders>
                </ThemeProvider>
              </AuthProvider>
            </ReactQueryProvider>
          </ReduxProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
