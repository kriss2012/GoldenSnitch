import SmoothScroll from '@/components/landing/SmoothScroll';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Manifesto from '@/components/landing/Manifesto';
import HowItWorks from '@/components/landing/HowItWorks';
import Roles from '@/components/landing/Roles';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import '@/styles/landing.css';

export default function Landing() {
  return (
    <SmoothScroll>
      <div className="grain bg-[#050505] text-white min-h-screen selection:bg-gold selection:text-black overflow-x-clip">
        <Nav />
        <main>
          <Hero />
          <Manifesto />
          <HowItWorks />
          <Roles />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
