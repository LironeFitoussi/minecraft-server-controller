import { Link } from "react-router";

export default function Header() {
  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl">
      <nav className="bg-white/20 backdrop-blur-xl rounded-3xl px-6 py-4 shadow-lg border border-white/30">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300"
          >
            Minecraft Controller
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
            >
              Home
            </Link>
            <Link 
              to="/minecraft" 
              className="text-gray-700 hover:text-blue-600 hover:bg-white/40 transition-all duration-300 font-semibold text-sm px-3 py-1 rounded-xl"
            >
              🎮 Server Control
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

