import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { Features } from './Features'
import { Pricing } from './Pricing'
import { Download } from './Download'
import { Footer } from './Footer'

interface Props { onNavigate: (v: string) => void; isLoggedIn: boolean }

export function LandingPage({ onNavigate, isLoggedIn }: Props) {
  return (<div className="min-h-screen bg-bg"><Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} /><Hero onLaunch={() => onNavigate('signup')} /><Features /><Pricing /><Download /><Footer /></div>)
}
