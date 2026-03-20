import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pb-16 md:pb-0">{children}</main>
    <Footer />
    <BottomNav />
    <FloatingWhatsApp />
  </div>
);

export default Layout;
