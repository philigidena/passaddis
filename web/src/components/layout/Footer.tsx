import { Link } from 'react-router-dom';
import { Ticket, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-card border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PassAddis</span>
            </Link>
            <p className="text-white/60 mb-4 max-w-md">
              Ethiopia's premier event ticketing platform. Discover amazing events,
              purchase tickets securely, and enjoy seamless entry.
            </p>
            <div className="flex items-center gap-4 text-white/60">
              <a href="tel:+251911000000" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +251 911 000 000
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-white/60 hover:text-primary transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-white/60 hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="text-white/60 hover:text-primary transition-colors">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link to="/signin" className="text-white/60 hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                Addis Ababa, Ethiopia
              </li>
              <li>
                <a
                  href="mailto:hello@passaddis.com"
                  className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@passaddis.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} PassAddis. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/40 hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
