import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>

          <div className="space-y-8">
            <p className="text-white/80">
              Have questions or need assistance? We're here to help! Reach out to us through any of the following channels:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-dark-card border border-white/10 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                    <a href="mailto:info@passaddis.com" className="text-primary hover:underline">
                      info@passaddis.com
                    </a>
                    <p className="text-white/60 text-sm mt-2">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-card border border-white/10 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                    <a href="tel:+251911234567" className="text-primary hover:underline">
                      +251 911 234 567
                    </a>
                    <p className="text-white/60 text-sm mt-2">
                      Available Mon-Fri, 9AM-6PM EAT
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-card border border-white/10 rounded-lg p-6 md:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
                    <p className="text-white/80">
                      Addis Ababa, Ethiopia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-card border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com/passaddis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-primary transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com/passaddis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-primary transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://twitter.com/passaddis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-primary transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="https://linkedin.com/company/passaddis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
