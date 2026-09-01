import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { Advantages } from "@/components/Advantages";
import { Testimonials } from "@/components/Testimonials";
import { BeforeAfter } from "@/components/BeforeAfter";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main data-testid="home-page">
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <HowItWorks />
      <Advantages />
      <Testimonials />
      <BeforeAfter />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
