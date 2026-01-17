import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function RefundPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-4">Refund Policy</h1>
          <p className="text-white/60 mb-8">Last updated: January 17, 2026</p>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. General Refund Policy</h2>
              <p>
                At PassAddis, we strive to ensure customer satisfaction. Our refund policy is designed
                to be fair to both attendees and event organizers. Please read this policy carefully
                before making a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Event Cancellations</h2>
              <p className="mb-2">
                If an event is cancelled by the organizer:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will receive a full refund of your ticket price</li>
                <li>Refunds will be processed within 7-10 business days</li>
                <li>Service fees may be non-refundable</li>
                <li>You will be notified via email about the cancellation and refund status</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Event Postponement</h2>
              <p className="mb-2">
                If an event is postponed or rescheduled:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your ticket remains valid for the new date</li>
                <li>If you cannot attend the new date, you may request a refund within 7 days of the announcement</li>
                <li>Refund requests must be submitted through your ticket details page</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Customer-Initiated Refunds</h2>
              <p className="mb-2">
                For customer-initiated refund requests:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refund eligibility depends on the event organizer's specific policy</li>
                <li>Some events may have a "no refund" policy</li>
                <li>If refunds are allowed, they must be requested at least 48 hours before the event</li>
                <li>A processing fee may be deducted from the refund amount</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Shop Orders</h2>
              <p className="mb-2">
                For merchandise and shop orders:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Items must be returned in original condition within 7 days of delivery</li>
                <li>Shipping costs are non-refundable</li>
                <li>Damaged or defective items will be fully refunded or replaced</li>
                <li>Custom or personalized items may not be eligible for refunds</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. How to Request a Refund</h2>
              <p className="mb-2">
                To request a refund:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Log in to your PassAddis account</li>
                <li>Navigate to "My Tickets" or "My Orders"</li>
                <li>Select the ticket or order you wish to refund</li>
                <li>Click on "Request Refund" and provide a reason</li>
                <li>Wait for confirmation via email</li>
              </ol>
              <p className="mt-4">
                Alternatively, contact our support team at{' '}
                <a href="mailto:refunds@passaddis.com" className="text-primary hover:underline">
                  refunds@passaddis.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Processing Time</h2>
              <p>
                Approved refunds are typically processed within 7-10 business days. The refund will
                be credited to your original payment method. Please note that your bank or payment
                provider may take additional time to process the refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Non-Refundable Items</h2>
              <p className="mb-2">
                The following are generally non-refundable:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service fees and processing charges</li>
                <li>Tickets for events marked as "no refund"</li>
                <li>Tickets purchased after the refund deadline</li>
                <li>Digital products or downloads</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Exceptional Circumstances</h2>
              <p>
                In cases of emergency, illness, or other exceptional circumstances, please contact
                our support team. We will review requests on a case-by-case basis and work with
                you to find a suitable solution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Refund Policy</h2>
              <p>
                We reserve the right to modify this Refund Policy at any time. Changes will be
                effective immediately upon posting. Your continued use of the service after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
              <p>
                If you have questions about our Refund Policy or need assistance with a refund request,
                please contact us at{' '}
                <a href="mailto:refunds@passaddis.com" className="text-primary hover:underline">
                  refunds@passaddis.com
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
