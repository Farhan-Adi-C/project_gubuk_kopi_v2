import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function LayoutFrontend({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
