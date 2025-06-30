import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img
                className="h-10 w-10"
                src="/logo.svg"
                alt="Assin Foso KCCR"
              />
              <div className="ml-3">
                <h3 className="text-lg font-bold">Assin Foso KCCR</h3>
                <p className="text-sm text-gray-300">Infectious Disease Epidemiology Group</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 max-w-md">
              Advancing infectious disease research and epidemiological studies to improve 
              public health outcomes in Ghana and West Africa through collaborative research, 
              capacity building, and evidence-based interventions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Research Projects
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="/knowledge-base" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Assin Foso, Central Region<br />
                  Ghana
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-300 text-sm">+233 (0) XXX XXX XXX</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-300 text-sm">research@assinfoso-kccr.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-sm text-gray-400">
            <span>© 2025 Assin Foso KCCR. All rights reserved.</span>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-sm text-gray-400 mr-2">Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-400 ml-2">for global health</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
