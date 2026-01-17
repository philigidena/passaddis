import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-white/60 mb-8">Last updated: January 17, 2026</p>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using PassAddis, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please
                do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use of Service</h2>
              <p className="mb-2">
                PassAddis provides a platform for event ticketing, booking, and curated shopping.
                You agree to use the service only for lawful purposes and in accordance with these Terms.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account and password
                and for restricting access to your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Ticket Purchases</h2>
              <p className="mb-2">
                All ticket sales are subject to availability and acceptance by the event organizer.
                Ticket prices are set by event organizers and may include service fees.
              </p>
              <p>
                You agree that all ticket purchases are final unless the event is cancelled by the
                organizer or as outlined in our Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Event Organizers</h2>
              <p>
                Event organizers are responsible for the accuracy of their event information,
                ticket availability, and event execution. PassAddis acts as a platform facilitator
                and is not responsible for event cancellations or changes made by organizers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Use the service for any illegal purposes</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
                <li>Resell tickets in violation of applicable laws</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are owned by
                PassAddis and are protected by international copyright, trademark, and other
                intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p>
                PassAddis shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of
                any material changes. Your continued use of the service after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of
                Ethiopia, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at{' '}
                <a href="mailto:info@passaddis.com" className="text-primary hover:underline">
                  info@passaddis.com
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
