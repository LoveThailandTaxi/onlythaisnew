import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../utils/seo';
import Footer from '../components/Footer';

export default function TermsOfService() {
  useEffect(() => {
    updatePageTitle('Terms of Service');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using OnlyThais, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Age Requirement</h2>
            <p>
              You must be at least 18 years old to use this service. By using OnlyThais, you represent and warrant that you are
              at least 18 years of age and have the legal capacity to enter into this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="mb-3">When you create an account with us, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Content Guidelines</h2>
            <p className="mb-3">Users agree not to post or share content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates any law or regulation</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains hate speech, harassment, or discrimination</li>
              <li>Depicts minors in any context</li>
              <li>Contains malware or malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Payment</h2>
            <p className="mb-3">
              Subscription fees are charged in advance on a monthly basis. All payments are processed securely through Stripe.
              You may cancel your subscription at any time, but refunds are not provided for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Creator Content</h2>
            <p className="mb-3">
              Creators retain ownership of their content but grant OnlyThais a license to display, distribute, and promote their
              content on the platform. Content may be removed at our discretion if it violates our Community Guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Activities</h2>
            <p className="mb-3">You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use automated systems to access the service</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to buy, sell, or transfer your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other
              reason at our sole discretion. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
            <p>
              The service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or
              usefulness of any content on the platform. We are not responsible for the conduct of any users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p>
              OnlyThais shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting
              from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes.
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. DMCA Copyright Policy</h2>
            <p className="mb-3">
              OnlyThais respects the intellectual property rights of others and expects users to do the same. In accordance
              with the Digital Millennium Copyright Act (DMCA), we will respond to valid notices of copyright infringement
              and may terminate accounts of repeat infringers.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Filing a DMCA Notice</h3>
            <p className="mb-3">
              If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement,
              please provide our Copyright Agent with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                A physical or electronic signature of the copyright owner or person authorized to act on their behalf
              </li>
              <li>
                Identification of the copyrighted work claimed to have been infringed
              </li>
              <li>
                Identification of the material that is claimed to be infringing, including its location on our platform
                (URL or specific description)
              </li>
              <li>
                Your contact information, including address, telephone number, and email address
              </li>
              <li>
                A statement that you have a good faith belief that use of the material is not authorized by the copyright
                owner, its agent, or the law
              </li>
              <li>
                A statement that the information in the notification is accurate, and under penalty of perjury, that you
                are authorized to act on behalf of the copyright owner
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">DMCA Contact Information</h3>
            <p className="mb-3">Send DMCA notices to our designated Copyright Agent:</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Copyright Agent</strong></p>
              <p>OnlyThais DMCA Department</p>
              <p>Email: <a href="mailto:dmca@onlythais.club" className="text-blue-600 hover:text-blue-700">dmca@onlythais.club</a></p>
              <p>Mailing Address: 123 Privacy Lane, San Francisco, CA 94102, USA</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Counter-Notice</h3>
            <p className="mb-3">
              If you believe your content was removed by mistake or misidentification, you may file a counter-notice
              containing:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your physical or electronic signature</li>
              <li>Identification of the material that was removed and its location before removal</li>
              <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
              <li>Your name, address, telephone number, and consent to jurisdiction in your location</li>
            </ul>
            <p className="mt-3">
              Please note that if you knowingly misrepresent that material or activity is not infringing, you may be liable
              for damages, including costs and attorneys' fees.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Repeat Infringer Policy</h3>
            <p>
              We will terminate accounts of users who are determined to be repeat infringers. A repeat infringer is a user
              who has been notified of infringing activity more than twice or has had content removed more than twice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at: <br />
              <a href="mailto:support@onlythais.club" className="text-blue-600 hover:text-blue-700">
                support@onlythais.club
              </a>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">Last updated: February 16, 2026</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
