import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bolt, X, Search } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import SearchResults from "./SearchResults";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    showResults,
    performSearch,
    closeResults,
  } = useSearch();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if user has already accepted/declined cookies
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (cookieConsent) {
      setShowCookieBanner(false);
    }
  }, []);

  const handleCookieConsent = (action: 'accept' | 'decline' | 'close') => {
    localStorage.setItem('cookie-consent', action);
    setShowCookieBanner(false);
  };

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery, 10);
    }
  };

  const toggleHeaderSearch = () => {
    setShowHeaderSearch(!showHeaderSearch);
    if (showHeaderSearch) {
      setSearchQuery('');
      closeResults();
    }
  };

  // Search in real-time as user types in header
  useEffect(() => {
    if (showHeaderSearch && searchQuery.trim().length > 2) {
      performSearch(searchQuery, 8);
    } else if (searchQuery.trim().length <= 2) {
      closeResults();
    }
  }, [searchQuery, showHeaderSearch, performSearch, closeResults]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pdf-tools", label: "PDF Bolt" },
    { href: "/image-tools", label: "Image Bolt" },
    { href: "/audio-tools", label: "Audio Bolt" },
    { href: "/text-tools", label: "Text Bolt" },
    { href: "/productivity-tools", label: "Productivity" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? "glassmorphism border-b border-white/10" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-4" data-testid="link-home">
              <div className="gradient-bg p-2 rounded-lg">
                <Bolt className="text-white text-xl" size={20} />
              </div>
              <h1 className="text-xl font-sans font-bold gradient-text">ToolSuite Pro</h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    location === link.href
                      ? "text-primary"
                      : "hover:text-primary"
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHeaderSearch}
                className="hidden md:flex items-center space-x-2 hover:text-primary"
                data-testid="button-header-search"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search</span>
              </Button>
              
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] glassmorphism">
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* Mobile Search */}
                    <div className="mb-4">
                      <form onSubmit={handleHeaderSearch}>
                        <div className="glassmorphism rounded-lg p-2 flex items-center">
                          <Search className="text-muted-foreground ml-2" size={16} />
                          <Input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0"
                            autoComplete="off"
                          />
                        </div>
                      </form>
                    </div>
                    
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                          location === link.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary/10 hover:text-primary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        data-testid={`mobile-link-${link.label.toLowerCase().replace(" ", "-")}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        {/* Header Search Bar */}
        {showHeaderSearch && (
          <div className="border-t border-white/10 px-4 py-3">
            <form onSubmit={handleHeaderSearch} className="max-w-2xl mx-auto">
              <div className="glassmorphism rounded-full p-2 flex items-center">
                <Search className="text-muted-foreground ml-4" size={18} />
                <Input
                  type="text"
                  placeholder="Search all tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0"
                  autoFocus
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleHeaderSearch}
                  className="text-muted-foreground hover:text-foreground mr-2"
                >
                  <X size={16} />
                </Button>
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-white/10 pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="gradient-bg p-2 rounded-lg">
                  <Bolt className="text-white text-xl" size={20} />
                </div>
                <h3 className="text-2xl font-sans font-bold gradient-text">ToolSuite Pro</h3>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Professional online tools and converters for all your file processing needs. 
                Convert, edit, and optimize files with ease.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-twitter">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-facebook">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-linkedin">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-github">
                  <i className="fab fa-github text-xl"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Tool Categories</h4>
              <ul className="space-y-2">
                <li><Link href="/pdf-tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-pdf">PDF Bolt</Link></li>
                <li><Link href="/image-tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-image">Image Bolt</Link></li>
                <li><Link href="/audio-tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-audio">Audio Bolt</Link></li>
                <li><Link href="/text-tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-text">Text Bolt</Link></li>
                <li><Link href="/productivity-tools" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-productivity">Productivity Bolt</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-about">About Us</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-contact">Contact</Link></li>
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} ToolSuite Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for creators</span>
              <span>•</span>
              <span>SSL Secured</span>
              <span>•</span>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div id="cookie-banner" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md glassmorphism rounded-lg p-4 border border-white/20 z-50">
          <div className="flex items-start space-x-3">
            <i className="fas fa-cookie-bite text-accent text-xl mt-1"></i>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">
                We use cookies to enhance your experience and analyze site usage. 
                <Link href="/privacy-policy" className="text-primary hover:underline" data-testid="link-cookie-policy">Learn more</Link>
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:opacity-90"
                  onClick={() => handleCookieConsent('accept')}
                  data-testid="button-accept-cookies"
                >
                  Accept All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-muted"
                  onClick={() => handleCookieConsent('decline')}
                  data-testid="button-decline-cookies"
                >
                  Decline
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground p-1"
              onClick={() => handleCookieConsent('close')}
              data-testid="button-close-banner"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Global Search Results */}
      <SearchResults
        results={searchResults}
        isVisible={showResults}
        onClose={closeResults}
        searchQuery={searchQuery}
      />
    </div>
  );
}
