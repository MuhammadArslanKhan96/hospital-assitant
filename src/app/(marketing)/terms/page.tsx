export default function TermsOfServicePage() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300">
      <h1 className="text-5xl font-black text-white mb-8 tracking-tighter">Terms of Service</h1>
      <div className="prose prose-invert prose-blue max-w-none">
        <p className="text-lg text-slate-400 mb-8">Last updated: October 2023</p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Agreement to Terms</h2>
        <p className="mb-6 leading-relaxed">
          By accessing or using VirtualCall.AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. Intellectual Property</h2>
        <p className="mb-6 leading-relaxed">
          The Service and its original content, features, and functionality are and will remain the exclusive property of VirtualCall.AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Termination</h2>
        <p className="mb-6 leading-relaxed">
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
        </p>
      </div>
    </div>
  );
}