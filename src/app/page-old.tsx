import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-indigo-600">O'Prep</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Your ultimate preparation platform for Nursing and Medical Council of
          Nigeria (NMCN) exams. Master your exams with comprehensive study
          materials, practice questions, and expert guidance.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/signin"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-indigo-600"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Programs
          </h2>

          {/* Pathways */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-8">
              1. PATHWAYS
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">RN Pathway</h4>
                <p className="text-gray-600 mb-4">
                  Weekly & Monthly Assessments, Mock Exams (Paper 1 & 2)
                </p>
                <p className="text-indigo-600 font-semibold">₦1,500/Month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">RM Pathway</h4>
                <p className="text-gray-600 mb-4">
                  Weekly & Monthly Assessments, Mock Exams (Paper 1 & 2)
                </p>
                <p className="text-indigo-600 font-semibold">₦1,500/Month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">RPHN Pathway</h4>
                <p className="text-gray-600 mb-4">
                  Weekly & Monthly Assessments, Mock Exams (Paper 1 & 2)
                </p>
                <p className="text-indigo-600 font-semibold">₦1,500/Month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">NCLEX Pathway</h4>
                <p className="text-gray-600 mb-4">
                  Monthly Subscription - Unlimited Access to Recent Updated
                  Questions
                </p>
                <p className="text-indigo-600 font-semibold">₦20,000/Month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">
                  Online Distance Learning (Direct Entry)
                </h4>
                <p className="text-gray-600 mb-4">
                  Weekly & Monthly Assessments, Mock Exams
                </p>
                <p className="text-indigo-600 font-semibold">₦2,000/Month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">
                  Specialty/Post Basic Pathway
                </h4>
                <p className="text-gray-600 mb-4">
                  Weekly & Monthly Assessments, Mock Exams
                </p>
                <p className="text-indigo-600 font-semibold">₦2,000/Month</p>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-xl font-semibold mb-4">
                Undergraduate Section
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h5 className="font-semibold">100 Level</h5>
                  <p className="text-gray-600">
                    Weekly & Monthly Assessments, Mock Exams
                  </p>
                  <p className="text-indigo-600 font-semibold">₦1,000/Month</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h5 className="font-semibold">200 Level</h5>
                  <p className="text-gray-600">
                    Weekly & Monthly Assessments, Mock Exams
                  </p>
                  <p className="text-indigo-600 font-semibold">₦1,000/Month</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h5 className="font-semibold">300 Level</h5>
                  <p className="text-gray-600">
                    Weekly & Monthly Assessments, Mock Exams
                  </p>
                  <p className="text-indigo-600 font-semibold">₦1,000/Month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Research */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-8">
              2. RESEARCH
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">
                  Undergraduate Research
                </h4>
                <div className="space-y-2">
                  <p>
                    <strong>Full Package (Chapters 1-5):</strong> ₦40,000
                  </p>
                  <p>
                    <strong>Partial Package (Chapters 1-3):</strong> ₦20,000
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">
                  Postgraduate Research
                </h4>
                <div className="space-y-2">
                  <p>
                    <strong>Thesis/Dissertation:</strong> Flexible Payment
                    (Negotiable)
                  </p>
                  <p>
                    <strong>Publication and Manuscript:</strong> Flexible
                    Payment (Negotiable)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* O'Level and JAMB */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-8">
              3. O&apos;LEVEL AND JAMB
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">
                  O&apos;Level (WAEC &amp; NECO)
                </h4>
                <p className="text-gray-600 mb-4">
                  Weekly & Monthly Assessments, Mock Exams
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>One-Time Payment:</strong> ₦40,000
                  </p>
                  <p>
                    <strong>Installment Payment (2x):</strong> ₦20,000 x 2
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold mb-2">JAMB</h4>
                <p className="text-gray-600 mb-4">
                  Weekly & Monthly Assessments, Mock Exams
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>One-Time Payment:</strong> ₦30,000
                  </p>
                  <p>
                    <strong>Installment Payment (2x):</strong> ₦15,000 x 2
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Research Consultation Session */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-8">
              4. RESEARCH CONSULTATION SESSION
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">Flexible Payment (Negotiable)</p>
            </div>
          </div>

          {/* Future Services */}
          <div>
            <h3 className="text-2xl font-semibold text-indigo-600 mb-8">
              5. FUTURE SERVICES
            </h3>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-lg text-center">
              <h4 className="text-2xl font-bold mb-4">Coming Soon!</h4>
              <p className="text-lg">
                New services and features coming soon. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2025 O'Prep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
