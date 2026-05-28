import Link from 'next/link';
import Navbar from '@/components/Navbar';

const FEATURES = [
  {
    title: 'Online Appointment Booking',
    desc: 'Book appointments from anywhere, anytime. Select your department, doctor, and preferred time slot with ease.',
    icon: '📅',
  },
  {
    title: 'Real-Time Queue Tracking',
    desc: 'Monitor your position in the queue and estimated wait time in real-time from your device.',
    icon: '📊',
  },
  {
    title: 'Emergency Prioritization',
    desc: 'Critical patients are automatically detected and fast-tracked for immediate medical attention.',
    icon: '🚨',
  },
  {
    title: 'Smart Priority Scoring',
    desc: 'AI-powered symptom analysis assigns accurate priority levels before you arrive at the hospital.',
    icon: '🧠',
  },
  {
    title: 'Estimated Wait Times',
    desc: 'Know exactly how long you will wait before seeing your doctor, reducing anxiety and uncertainty.',
    icon: '⏱️',
  },
  {
    title: 'Patient Dashboard',
    desc: 'Access your complete appointment history, queue status, and health records in one place.',
    icon: '👤',
  },
  {
    title: 'Doctor Availability',
    desc: 'View real-time doctor schedules and availability to choose the best time for your visit.',
    icon: '🩺',
  },
  {
    title: 'Admin Queue Control',
    desc: 'Hospital staff can manage queues, modify priorities, and monitor patient flow efficiently.',
    icon: '⚙️',
  },
  {
    title: 'Instant Notifications',
    desc: 'Receive updates on appointment confirmations, queue movements, and priority changes.',
    icon: '🔔',
  },
  {
    title: 'Secure Authentication',
    desc: 'Your data is protected with secure login, session management, and encrypted credentials.',
    icon: '🔒',
  },
  {
    title: 'Department Management',
    desc: 'Organized by medical departments for streamlined navigation and accurate doctor matching.',
    icon: '🏥',
  },
  {
    title: 'Smooth Hospital Workflow',
    desc: 'From registration to treatment, every step is optimized for speed and patient comfort.',
    icon: '✨',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Book Your Appointment',
    desc: 'Select your department, choose a doctor, pick a time, and describe your symptoms — all online.',
  },
  {
    step: '02',
    title: 'Automatic Priority Assessment',
    desc: 'Our system analyzes your symptoms using medically-inspired protocols (including WHO ETAT ABCD concepts) to estimate urgency.',
  },
  {
    step: '03',
    title: 'Smart Queue Placement',
    desc: 'You are placed in a priority queue — critical cases are seen first while routine visits follow in order.',
  },
  {
    step: '04',
    title: 'Real-Time Updates',
    desc: 'Track your queue position and estimated wait time live. Receive notifications as your turn approaches.',
  },
  {
    step: '05',
    title: 'See Your Doctor',
    desc: 'When it is your turn, proceed directly to your assigned doctor for treatment — no unnecessary delays.',
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* ======== HERO ======== */}
      <section
        id="home"
        className="relative min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-surface-accent -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/60 text-brand-dark text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-soft" />
              Intelligent Hospital Queue Management
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              Faster Care for{' '}
              <span className="text-brand">Those Who Need</span>{' '}
              It Most
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed">
              CareLink replaces first-come-first-serve with intelligent
              priority-based scheduling. Book appointments, track your queue in
              real-time, and receive care when you need it.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/patient/signup"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Book Appointment
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-text-primary bg-white hover:bg-surface-hover border border-border rounded-xl transition-all duration-200"
              >
                Patient Login
              </Link>
              <Link
                href="/auth/admin/login"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-navy hover:text-brand transition-colors"
              >
                Admin Login →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======== ABOUT ======== */}
      <section id="about" className="py-20 lg:py-28 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Why Choose CareLink?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              We bring hospital queue management into the modern era — reducing
              wait times, prioritizing emergencies, and creating a smoother
              healthcare experience for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                title: 'Reduced Wait Times',
                desc: 'Smart prioritization means emergency patients are seen immediately, and everyone else waits less.',
                icon: '⏱️',
              },
              {
                title: 'Real-Time Monitoring',
                desc: 'Track your queue position and estimated wait time from your phone — no need to sit in the lobby.',
                icon: '📱',
              },
              {
                title: 'Emergency First Response',
                desc: 'Critical conditions are automatically detected and fast-tracked for immediate medical care.',
                icon: '🚑',
              },
              {
                title: 'Smart Scheduling',
                desc: 'Book appointments online with symptom-based priority prediction before you arrive.',
                icon: '🗓️',
              },
              {
                title: 'Efficient Patient Flow',
                desc: 'Optimized workflows mean doctors see the right patients at the right time.',
                icon: '🔄',
              },
              {
                title: 'Better Healthcare Experience',
                desc: 'A calmer, more organized hospital visit with transparent wait times and clear communication.',
                icon: '💚',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-border/50 hover:border-brand/20 hover:shadow-md transition-all duration-300"
              >
                <div className="text-2xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              A comprehensive suite of tools for patients, doctors, and hospital
              administrators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white rounded-xl p-5 border border-border/50 hover:border-brand/30 hover:shadow-md transition-all duration-300"
              >
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              How CareLink Works
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              From booking to treatment — a streamlined journey designed around
              patient needs.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Vertical connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-[23px] top-12 bottom-0 w-px bg-border" />
                )}
                {/* Step circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {item.step}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Brief ABCD reference */}
          <div className="mt-16 max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-border/50">
            <h3 className="text-base font-semibold text-text-primary mb-3">
              Triage-Inspired Prioritization
            </h3>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              Our priority engine draws inspiration from the WHO ETAT (Emergency
              Triage Assessment and Treatment) framework, evaluating patients
              across four key dimensions:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { letter: 'A', label: 'Airway', desc: 'Obstruction, choking, throat conditions' },
                { letter: 'B', label: 'Breathing', desc: 'Respiratory distress, oxygen levels' },
                { letter: 'C', label: 'Circulation', desc: 'Pulse, consciousness, bleeding' },
                { letter: 'D', label: 'Dehydration', desc: 'Fluid levels, lethargy indicators' },
              ].map((item) => (
                <div
                  key={item.letter}
                  className="flex items-start gap-3 p-3 rounded-lg bg-surface-secondary"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-100 text-brand-dark flex items-center justify-center text-sm font-bold">
                    {item.letter}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {item.label}
                    </p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======== APPOINTMENTS CTA ======== */}
      <section id="appointments" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-brand to-brand-dark rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Skip the Wait?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Join CareLink today and experience healthcare that puts your
                time and well-being first.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/patient/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-brand bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Book Your Appointment
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 rounded-xl transition-all duration-200"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="py-10 border-t border-border bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-text-primary">
                CareLink
              </span>
            </div>
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} CareLink. Intelligent Hospital Queue
              Management System.
            </p>
            <div className="flex gap-6">
              <Link href="/auth" className="text-xs text-text-muted hover:text-brand transition-colors">
                Patient Login
              </Link>
              <Link href="/auth/admin/login" className="text-xs text-text-muted hover:text-brand transition-colors">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
