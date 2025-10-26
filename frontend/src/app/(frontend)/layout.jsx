import Footer from "@/components/Footer";
import Header from "@/components/Header";
import toast, { Toaster } from "react-hot-toast";

export default function LayoutFrontend({ children }) {
  return (
    <>
      <Header />
      {children}
      <Toaster position="top-center" reverseOrder={false} />
      <Footer />
    </>
  );
}
