import { HelpCircle, Book, PhoneCall, Mail } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
  const categories = [
    {
      title: "Getting Started",
      description: "Everything you need to know to set up your first AI voice agent and configure your dashboard.",
      icon: <Book className="w-8 h-8 text-vc-cyan" />
    },
    {
      title: "Billing & Subscriptions",
      description: "Manage your usage limits, understand pricing, and update your payment methods.",
      icon: <HelpCircle className="w-8 h-8 text-vc-cyan" />
    },
    {
      title: "Telephony Setup",
      description: "Learn how to port numbers, configure SIP trunks, and optimize call routing.",
      icon: <PhoneCall className="w-8 h-8 text-vc-cyan" />
    }
  ];

  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Help Center</h1>
        <p className="text-xl text-slate-400">Find answers to common questions, explore tutorials, and get the most out of VirtualCall.AI.</p>

        <div className="mt-10 relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for articles, guides, or FAQs..."
            className="w-full bg-slate-900 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-vc-cyan focus:ring-1 focus:ring-vc-cyan transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {categories.map((category, idx) => (
          <div key={idx} className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 hover:border-vc-cyan/30 transition-all cursor-pointer">
            <div className="mb-6">{category.icon}</div>
            <h3 className="text-xl font-bold text-white mb-3">{category.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{category.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-vc-dark to-slate-900 rounded-3xl p-10 border border-white/10 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-vc-cyan/10 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-vc-cyan" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Our support team is available 24/7 to assist you with any technical issues or account inquiries.</p>
        <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-black text-vc-dark bg-vc-green rounded-full hover:bg-vc-cyan transition-all">
          Contact Support
        </Link>
      </div>
    </div>
  );
}