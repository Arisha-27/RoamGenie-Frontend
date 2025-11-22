import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center transition-all duration-300 hover:rotate-12 hover:shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">🧞</span>
              </div>
              <span className="text-xl font-bold text-foreground">RoamGenie</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Your personal AI travel planner, creating custom itineraries tailored to your interests and budget.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 transition-transform duration-300 hover:scale-105">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trip-planner" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/passport-scanner" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block">
                  Passport Scanner
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 transition-transform duration-300 hover:scale-105">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block">
                  Terms of Service
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p className="transition-transform duration-300 hover:scale-105 inline-block">&copy; 2025 RoamGenie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;