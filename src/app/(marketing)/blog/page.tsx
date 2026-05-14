import Link from 'next/link';
import { ArrowRight, BookOpen, MessageSquare, Terminal } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      title: "The Future of Voice AI in Customer Service",
      excerpt: "How intelligent voice agents are transforming the way businesses interact with their customers, providing 24/7 support without sacrificing quality.",
      date: "October 15, 2023",
      category: "Industry Insights",
      icon: <MessageSquare className="w-6 h-6 text-vc-cyan" />
    },
    {
      title: "Building Scalable Telephony Infrastructure",
      excerpt: "Deep dive into the architecture required to support thousands of concurrent calls with ultra-low latency.",
      date: "September 28, 2023",
      category: "Engineering",
      icon: <Terminal className="w-6 h-6 text-vc-cyan" />
    },
    {
      title: "Maximizing Outbound ROI with AI Agents",
      excerpt: "Strategies for deploying AI agents in outbound sales campaigns to increase connection rates and qualify leads faster.",
      date: "September 10, 2023",
      category: "Growth",
      icon: <BookOpen className="w-6 h-6 text-vc-cyan" />
    }
  ];

  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">The VirtualCall.AI Blog</h1>
        <p className="text-xl text-slate-400">Insights, updates, and engineering deep dives from the team building the future of voice infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, idx) => (
          <div key={idx} className="group bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 hover:border-vc-cyan/30 transition-all duration-300 shadow-2xl flex flex-col">
            <div className="w-12 h-12 bg-vc-cyan/10 rounded-xl flex items-center justify-center mb-6">
              {post.icon}
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
              <span>{post.category}</span>
              <span>•</span>
              <span>{post.date}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-vc-cyan transition-colors">{post.title}</h3>
            <p className="text-slate-400 leading-relaxed mb-8 flex-grow">{post.excerpt}</p>
            <Link href="#" className="inline-flex items-center text-sm font-bold text-vc-cyan hover:text-white transition-colors">
              Read Article <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}