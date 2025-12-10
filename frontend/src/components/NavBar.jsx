//import NavbarBg from '../assets/rectangle.png';
import Logo from '../assets/Logo.png';

function Navbar({ onNavigate, onLogout }) {
  return (
    <nav className="relative bg-[#8A4B27] shadow-[0_3px_0_#5C2E12] h-20 flex items-center">
      
      {/* Logo (small) */}
      <div className="flex items-center ml-2">
        <img 
          src={Logo}
          alt="Logo"
          className="image-render-pixel w-32 h-32"   // MUCH smaller
        />
      </div>

      {/* Navigation links */}
      <ul className="flex space-x-4 ml-auto mr-4 font-press text-[#FFE8C9] text-[12px] leading-none">
        <li>
          <button 
            onClick={() => onNavigate('home')}
            className="hover:text-[rgb(188,138,82)] transition-colors"
          >
            Home
          </button>
        </li>

        <li>
          <button 
            onClick={() => onNavigate('coursepicker')}
            className="hover:text-[rgb(188,138,82)] transition-colors"
          >
            Course Picker
          </button>
        </li>

        <li>
          <button 
            onClick={() => onNavigate('schedule')}
            className="hover:text-[rgb(188,138,82)] transition-colors"
          >
            Schedule Builder
          </button>
        </li>

        <li>
          <button 
            onClick={() => onNavigate('progress')}
            className="hover:text-[rgb(188,138,82)] transition-colors"
          >
            Progress
          </button>
        </li>

        <li>
          <button 
            onClick={onLogout}
            className="hover:text-[rgb(188,138,82)] transition-colors"
          >
            Sign Out
          </button>
        </li>
      </ul>

    </nav>
  );
}

export default Navbar