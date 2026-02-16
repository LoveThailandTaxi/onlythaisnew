import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../utils/seo';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  useEffect(() => {
    updatePageTitle('Privacy Policy');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, password, display name)</li>
              <li>Profile information (bio, photos, physical characteristics)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Messages and communications with other users</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="mb-3">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With other users as part of the service (profile information, messages)</li>
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p>
              We use industry-standard security measures to protect your information, including encryption, secure servers,
              and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services.
              We will delete or anonymize your information upon account deletion, except where we need to retain it
              for legal or legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate
              safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p>
              Our service is not intended for anyone under 18 years of age. We do not knowingly collect personal information
              from children. If we become aware that a child has provided us with personal information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. GDPR Compliance (European Users)</h2>
            <p className="mb-3">
              If you are located in the European Economic Area (EEA), you have certain data protection rights under the
              General Data Protection Regulation (GDPR). We aim to take reasonable steps to allow you to correct, amend,
              delete, or limit the use of your personal data.
            </p>
            <p className="mb-3">Under GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> You have the right to request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> You have the right to request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> You have the right to request deletion of your personal data under certain conditions</li>
              <li><strong>Right to Restrict Processing:</strong> You have the right to request restriction of processing your personal data</li>
              <li><strong>Right to Data Portability:</strong> You have the right to request transfer of your data to another organization</li>
              <li><strong>Right to Object:</strong> You have the right to object to our processing of your personal data</li>
              <li><strong>Right to Withdraw Consent:</strong> You have the right to withdraw consent at any time where we relied on consent</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@onlythais.club" className="text-blue-600 hover:text-blue-700">
                privacy@onlythais.club
              </a>. We will respond to your request within 30 days.
            </p>
            <p className="mt-3">
              <strong>Legal Basis for Processing:</strong> We process your personal data based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Consent: When you have given clear consent for us to process your data</li>
              <li>Contract: When processing is necessary to perform a contract with you</li>
              <li>Legal Obligation: When we must process your data to comply with the law</li>
              <li>Legitimate Interests: When processing is necessary for our legitimate interests and does not override your rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. CCPA Compliance (California Users)</h2>
            <p className="mb-3">
              If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights
              regarding your personal information.
            </p>
            <p className="mb-3">Under CCPA, California residents have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Right to Know:</strong> You have the right to request that we disclose what personal information we
                collect, use, disclose, and sell
              </li>
              <li>
                <strong>Right to Delete:</strong> You have the right to request deletion of your personal information,
                subject to certain exceptions
              </li>
              <li>
                <strong>Right to Opt-Out:</strong> You have the right to opt-out of the sale of your personal information.
                We do not sell personal information.
              </li>
              <li>
                <strong>Right to Non-Discrimination:</strong> You have the right not to receive discriminatory treatment
                for exercising your CCPA rights
              </li>
            </ul>
            <p className="mt-3">
              <strong>Categories of Personal Information Collected:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Identifiers (name, email, account credentials)</li>
              <li>Personal information categories (physical characteristics, photos)</li>
              <li>Commercial information (subscription status, payment history)</li>
              <li>Internet activity (browsing history, interactions with our service)</li>
              <li>Geolocation data (city/region information)</li>
            </ul>
            <p className="mt-3">
              To exercise your CCPA rights, please contact us at{' '}
              <a href="mailto:privacy@onlythais.club" className="text-blue-600 hover:text-blue-700">
                privacy@onlythais.club
              </a>{' '}
              or call us at 1-800-XXX-XXXX. We will verify your identity before processing your request and respond within
              45 days.
            </p>
            <p className="mt-3">
              <strong>Do Not Sell My Personal Information:</strong> We do not sell your personal information to third parties.
              We may share information with service providers who assist us in operating our platform, but this does not
              constitute a "sale" under CCPA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Cookie Policy</h2>
            <p className="mb-3">
              We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small
              text files stored on your device that help us provide and improve our services.
            </p>
            <p className="mb-3"><strong>Types of Cookies We Use:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for the website to function properly (authentication, security)
              </li>
              <li>
                <strong>Functional Cookies:</strong> Remember your preferences and settings
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Used to deliver relevant advertisements (if applicable)
              </li>
            </ul>
            <p className="mt-3">
              You can control and manage cookies through your browser settings. Note that disabling certain cookies may
              affect the functionality of our service. For more information about cookies and how to manage them, visit
              www.allaboutcookies.org.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date. For material changes, we will provide
              additional notice such as email notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="mb-3">
              If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please
              contact us:
            </p>
            <ul className="list-none space-y-2">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@onlythais.club" className="text-blue-600 hover:text-blue-700">
                  privacy@onlythais.club
                </a>
              </li>
              <li>
                <strong>General Support:</strong>{' '}
                <a href="mailto:support@onlythais.club" className="text-blue-600 hover:text-blue-700">
                  support@onlythais.club
                </a>
              </li>
              <li><strong>Mailing Address:</strong> OnlyThais, 123 Privacy Lane, San Francisco, CA 94102, USA</li>
            </ul>
          </section>

          <p className="text-sm text-gray-500 mt-8">Last updated: February 16, 2026</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
