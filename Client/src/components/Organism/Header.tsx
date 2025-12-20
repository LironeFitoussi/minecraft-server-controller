import { Link, useLocation } from "react-router";

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 minecraft-card minecraft-pattern z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b-2 border-[#5A4A3A]">
        <Link 
          to="/" 
          className="text-2xl font-bold text-white pixelify-sans-bold hover:text-[#7CB342] transition-colors duration-300 block"
          style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}
        >
          🎮 Minecraft Controller
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          to="/" 
          className={`block px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-sm pixelify-sans ${
            location.pathname === '/'
              ? 'minecraft-card-light text-white border-2 border-[#7CB342]'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          style={{ textShadow: location.pathname === '/' ? '2px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 0px rgba(0,0,0,0.5)' }}
        >
          🏠 Home
        </Link>
        <Link 
          to="/minecraft" 
          className={`block px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-sm pixelify-sans ${
            location.pathname === '/minecraft'
              ? 'minecraft-card-light text-white border-2 border-[#7CB342]'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          style={{ textShadow: location.pathname === '/minecraft' ? '2px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 0px rgba(0,0,0,0.5)' }}
        >
          🎮 Server Control
        </Link>
        <Link 
          to="/stats" 
          className={`block px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-sm pixelify-sans ${
            location.pathname === '/stats'
              ? 'minecraft-card-light text-white border-2 border-[#7CB342]'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          style={{ textShadow: location.pathname === '/stats' ? '2px 2px 0px rgba(0,0,0,0.5)' : '1px 1px 0px rgba(0,0,0,0.5)' }}
        >
          📊 Server Stats
        </Link>
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t-2 border-[#5A4A3A]">
        <p className="text-xs text-white/70 pixelify-sans text-center" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
          Minecraft Server Controller
        </p>
      </div>
    </aside>
  );
}

