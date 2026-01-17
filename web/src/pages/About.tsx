import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <h1 className="text-4xl font-bold text-white mb-8">About PassAddis</h1>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section className="bg-dark-card border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
              <p className="text-lg">
                PassAddis is Ethiopia's premier event-first platform, revolutionizing how people discover,
                attend, and engage with events. We combine ticketing, booking, and curated shopping to
                create a seamless experience for event-goers and organizers alike.
              </p>
            </section>

            <section className="bg-dark-card border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">What We Do</h2>
              <p className="text-lg">
                We provide a comprehensive platform that connects event organizers with attendees,
                offering tools for ticket sales, event management, and merchandise shopping. Our
                platform makes it easy to discover exciting events happening across Ethiopia.
              </p>
            </section>

            <section className="bg-dark-card border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Our Vision</h2>
              <p className="text-lg">
                To become the leading platform for cultural and entertainment experiences in Ethiopia,
                fostering connections between communities and creating memorable moments through
                technology and innovation.
              </p>
            </section>

            <section className="bg-dark-card border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Location</h2>
              <p className="text-lg">
                Based in Addis Ababa, Ethiopia, we are proud to serve the vibrant Ethiopian community
                and contribute to the growth of the local entertainment and cultural scene.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
