export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create or modify your account, 
            request on-demand services, contact customer support, or otherwise communicate with us.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. Use of Information</h2>
          <p className="mb-4">
            We may use the information we collect about you to provide, maintain, and improve our services, 
            such as to facilitate payments, send receipts, provide products and services you request.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. Sharing of Information</h2>
          <p className="mb-4">
            We do not share personal information with companies, organizations and individuals outside of Shopora 
            unless one of the following circumstances applies: with your consent, for legal reasons, or with domain administrators.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">4. Cookies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track the activity on our service and hold certain information.
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </div>
      </div>
    </div>
  )
}
