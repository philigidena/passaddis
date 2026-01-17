import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-white/60 mb-8">Last updated: January 17, 2026</p>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-2">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Event attendance and ticket purchase history</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process your ticket purchases and orders</li>
                <li>Send you event confirmations and updates</li>
                <li>Communicate with you about our services</li>
                <li>Improve and personalize your experience</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <p className="mb-2">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Event organizers (for events you purchase tickets to)</li>
                <li>Payment processors (to complete transactions)</li>
                <li>Service providers who assist in operating our platform</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of marketing communications</li>
                <li>Object to processing of your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to improve your experience,
                analyze usage patterns, and personalize content. You can control cookie settings
                through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13. We do not knowingly collect
                personal information from children under 13. If you believe we have collected
                information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services,
                comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than Ethiopia.
                We ensure appropriate safeguards are in place to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us at{' '}
                <a href="mailto:privacy@passaddis.com" className="text-primary hover:underline">
                  privacy@passaddis.com
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
