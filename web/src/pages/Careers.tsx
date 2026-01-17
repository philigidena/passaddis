import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function CareersPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <h1 className="text-4xl font-bold text-white mb-8">Careers at PassAddis</h1>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Join Our Team</h2>
              <p>
                At PassAddis, we're building the future of events and entertainment in Ethiopia.
                We're looking for passionate, talented individuals who want to make a difference
                in how people discover and experience events.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Why Work With Us?</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be part of a fast-growing startup in Ethiopia's tech ecosystem</li>
                <li>Work on challenging problems that impact thousands of users</li>
                <li>Collaborative and innovative work environment</li>
                <li>Opportunities for growth and learning</li>
                <li>Competitive compensation and benefits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Current Openings</h2>
              <p className="mb-4">
                We're always looking for talented individuals. Check back soon for open positions
                or send us your resume at{' '}
                <a href="mailto:careers@passaddis.com" className="text-primary hover:underline">
                  careers@passaddis.com
                </a>
              </p>

              <div className="bg-dark-card border border-white/10 rounded-lg p-6">
                <p className="text-white/60">
                  No open positions at the moment. Follow us on social media or check back later
                  for updates on new opportunities.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Get In Touch</h2>
              <p>
                Interested in joining our team? Even if we don't have an open position that matches
                your skills right now, we'd love to hear from you. Send your resume and a brief
                introduction to{' '}
                <a href="mailto:careers@passaddis.com" className="text-primary hover:underline">
                  careers@passaddis.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
