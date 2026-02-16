import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { updatePageTitle } from '../utils/seo';
import Footer from '../components/Footer';

export default function FAQ() {
  useEffect(() => {
    updatePageTitle('FAQ');
  }, []);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign In" on the homepage, then select "Sign Up" to create a new account with your email and password. You must be 18 or older to use OnlyThais.'
        },
        {
          q: 'Is OnlyThais free to use?',
          a: 'Creating an account and browsing profiles is free. However, to send unlimited messages and access premium features, you need a subscription. Standard is $29.99/month and VIP is $49.99/month.'
        },
        {
          q: 'What are the different subscription tiers?',
          a: 'Standard ($29.99/month) includes 50 messages per month, profile browsing, and favorites. VIP ($49.99/month) includes unlimited messages, priority support, verification badge, and weekly Thai newsletter.'
        }
      ]
    },
    {
      category: 'For Creators',
      questions: [
        {
          q: 'How do I become a creator?',
          a: 'Click "Become a Creator" on the homepage and fill out the application form. You must be 18+, provide verification documents, and create a detailed profile.'
        },
        {
          q: 'What can I offer as a creator?',
          a: 'Creators can offer various services including dating companionship, exclusive content creation, escort services, massage services, or ladyboy entertainment. Be clear about your offerings in your profile.'
        },
        {
          q: 'How do I get paid?',
          a: 'Payment processing and creator monetization features are coming soon. Currently, creators can connect with subscribers and arrange payments directly.'
        }
      ]
    },
    {
      category: 'Safety & Privacy',
      questions: [
        {
          q: 'Is my information safe?',
          a: 'Yes. We use industry-standard encryption and security measures. Your payment information is processed securely through Stripe. We never share your personal information without consent.'
        },
        {
          q: 'How do I report inappropriate content or behavior?',
          a: 'Use the report button on any profile or message, or contact our support team at support@onlythais.club. All reports are reviewed promptly and kept confidential.'
        },
        {
          q: 'Can I block someone?',
          a: 'Blocking features are coming soon. Currently, you can report problematic users and our team will take appropriate action.'
        }
      ]
    },
    {
      category: 'Subscriptions & Payments',
      questions: [
        {
          q: 'How do I cancel my subscription?',
          a: 'Go to your dashboard and click "Manage Subscription" to cancel. You will retain access until the end of your current billing period.'
        },
        {
          q: 'Do you offer refunds?',
          a: 'We do not offer refunds for partial months. If you cancel, you will have access until the end of your paid period.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor, Stripe.'
        }
      ]
    },
    {
      category: 'Messaging',
      questions: [
        {
          q: 'How many messages can I send?',
          a: 'Free users cannot send messages. Standard subscribers get 50 messages per month. VIP subscribers get unlimited messages.'
        },
        {
          q: 'Do messages expire?',
          a: 'No, your message history is saved. However, if you downgrade or cancel your subscription, you may lose the ability to send new messages.'
        },
        {
          q: 'Can creators message me first?',
          a: 'Yes, creators can initiate conversations with subscribers. This does not count against your message limit.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'The site is not loading properly, what should I do?',
          a: 'Try clearing your browser cache, using a different browser, or checking your internet connection. If issues persist, contact support@onlythais.club.'
        },
        {
          q: 'I forgot my password, how do I reset it?',
          a: 'Click "Forgot Password" on the login page and follow the instructions sent to your email.'
        },
        {
          q: 'Can I use OnlyThais on my mobile device?',
          a: 'Yes! OnlyThais is fully responsive and works on all mobile devices through your web browser.'
        }
      ]
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-8">
          Find answers to common questions about OnlyThais. Can't find what you're looking for?{' '}
          <Link to="/contact" className="text-blue-600 hover:text-blue-700">Contact us</Link>
        </p>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-800 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {category.questions.map((faq) => {
                  const currentIndex = questionIndex++;
                  const isOpen = openIndex === currentIndex;

                  return (
                    <div key={currentIndex} className="p-6">
                      <button
                        onClick={() => toggleQuestion(currentIndex)}
                        className="w-full flex items-start justify-between text-left"
                      >
                        <h3 className="text-lg font-medium text-gray-900 pr-8">{faq.q}</h3>
                        {isOpen ? (
                          <ChevronUp className="flex-shrink-0 w-5 h-5 text-gray-500 mt-1" />
                        ) : (
                          <ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-500 mt-1" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any questions or concerns.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
