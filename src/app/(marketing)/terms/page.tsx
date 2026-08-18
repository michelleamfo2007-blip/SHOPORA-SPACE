export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the Shopora platform, you agree to be bound by these Terms. 
            If you disagree with any part of the terms then you may not access the service.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Shopora provides an e-commerce platform that enables merchants to build storefronts 
            and sell products or services online.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            When you create an account with us, you must provide information that is accurate, complete, 
            and current at all times. Failure to do so constitutes a breach of the Terms.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">4. Merchant Responsibilities</h2>
          <p className="mb-4">
            You are responsible for all activity that occurs under your account. You must not transmit any worms 
            or viruses or any code of a destructive nature. You are responsible for the goods and services you sell.
          </p>
        </div>
      </div>
    </div>
  )
}
