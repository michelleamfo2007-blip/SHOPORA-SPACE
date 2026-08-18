export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Contact Us</h1>
        <p className="text-xl text-slate-600 mb-12">
          Have a question or need help setting up your store? We are here for you.
        </p>
        
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Get in Touch</h2>
          <div className="space-y-6 text-left">
            <div>
              <h3 className="font-semibold text-slate-900">Email Support</h3>
              <p className="text-slate-600">support@shopora.space</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Sales Inquiries</h3>
              <p className="text-slate-600">sales@shopora.space</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Office</h3>
              <p className="text-slate-600">123 Commerce Blvd, Tech City, TC 10101</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
