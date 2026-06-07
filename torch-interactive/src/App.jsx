import Navbar from './components/Navbar'
import Hero from './components/Hero'
import GamesSection from './components/GamesSection'
import StudioSection from './components/StudioSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="section-sep" />
        <GamesSection />
        <div className="section-sep" />
        <StudioSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
