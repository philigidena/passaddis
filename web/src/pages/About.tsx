import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Target, Zap, Eye, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <motion.h1
            className="text-4xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            About PassAddis
          </motion.h1>
          <motion.div
            className="h-1 w-20 bg-primary rounded-full mb-8"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '5rem', opacity: 1 }}
            transition={{ duration: 0.6 }}
          ></motion.div>

          <div className="space-y-6 text-white/80 leading-relaxed">
            <motion.section
              className="group bg-dark-card border border-white/10 rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
                  <p className="text-lg">
                    PassAddis is Ethiopia's premier event-first platform, revolutionizing how people discover,
                    attend, and engage with events. We combine ticketing, booking, and curated shopping to
                    create a seamless experience for event-goers and organizers alike.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="group bg-dark-card border border-white/10 rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-4">What We Do</h2>
                  <p className="text-lg">
                    We provide a comprehensive platform that connects event organizers with attendees,
                    offering tools for ticket sales, event management, and merchandise shopping. Our
                    platform makes it easy to discover exciting events happening across Ethiopia.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="group bg-dark-card border border-white/10 rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-4">Our Vision</h2>
                  <p className="text-lg">
                    To become the leading platform for cultural and entertainment experiences in Ethiopia,
                    fostering connections between communities and creating memorable moments through
                    technology and innovation.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="group bg-dark-card border border-white/10 rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-4">Location</h2>
                  <p className="text-lg">
                    Based in Addis Ababa, Ethiopia, we are proud to serve the vibrant Ethiopian community
                    and contribute to the growth of the local entertainment and cultural scene.
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
