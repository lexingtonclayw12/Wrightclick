import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar    from './components/Navbar'
import HeroScene from './components/HeroScene'
import Work      from './components/Work'
import Services  from './components/Services'
import Process   from './components/Process'
import About     from './components/About'
import Contact   from './components/Contact'
import Footer    from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  return (
    <div className="bg-screen font-sans antialiased overflow-x-hidden">
      <Navbar />
      <HeroScene />
      <Work />
      <Services />
      <Process />
      <About />
      <Contact />
      <Footer />
    </div>
  )
}
