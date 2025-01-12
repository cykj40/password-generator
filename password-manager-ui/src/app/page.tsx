'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import { ArrowRightIcon, KeyIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    name: 'Secure Password Storage',
    description: 'Your passwords are encrypted using military-grade encryption before being stored.',
    icon: LockClosedIcon,
  },
  {
    name: 'Password Generator',
    description: 'Generate strong, unique passwords that are impossible to guess.',
    icon: KeyIcon,
  },
  {
    name: 'Zero-Knowledge Security',
    description: 'We cannot access your passwords. Only you have the encryption key.',
    icon: ShieldCheckIcon,
  },
];

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const headerAnimation = useScrollAnimation();
  const feature1Animation = useScrollAnimation();
  const feature2Animation = useScrollAnimation();
  const feature3Animation = useScrollAnimation();

  // Handle authenticated user redirect
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  // Show nothing while loading
  if (!isLoaded) {
    return null;
  }

  return (
    <div className="relative isolate">
      {/* Animated background gradient */}
      <div
        className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem] animate-gradient-shift"
        aria-hidden="true"
      >
        <div
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#1d4ed8] to-[#3b82f6] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem] animate-pulse-slow"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero section */}
      <div className="px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <SignedOut>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Secure Password Manager
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Keep your passwords safe and accessible. Generate strong passwords, store them securely,
                and access them from anywhere.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <SignUpButton mode="modal">
                  <button className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                    Start Securing Your Passwords
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold leading-6 text-white hover:text-blue-400">
                    Login <span aria-hidden="true">→</span>
                  </button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-bounce-in">
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 group"
              >
                Go to Dashboard
                <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div
          ref={headerAnimation.elementRef}
          className={`mx-auto max-w-2xl lg:text-center transition-all duration-700 transform ${headerAnimation.isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
            }`}
        >
          <h2 className="text-base font-semibold leading-7 text-blue-400">Password Security</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to manage passwords
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our password manager combines security with simplicity, giving you peace of mind without the complexity.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => {
              const animation = [feature1Animation, feature2Animation, feature3Animation][index];
              return (
                <div
                  key={feature.name}
                  ref={animation.elementRef}
                  className={`flex flex-col transition-all duration-700 transform ${animation.isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                    }`}
                  style={{
                    transitionDelay: `${index * 200}ms`
                  }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <feature.icon
                      className={`h-5 w-5 flex-none text-blue-400 transition-transform duration-500 ${animation.isVisible ? 'scale-100' : 'scale-0'
                        }`}
                      aria-hidden="true"
                    />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0); }
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-gradient-shift {
          animation: gradient-shift 20s ease-in-out infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 0.5s both;
        }

        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.7s ease-out 0.3s both;
        }

        .animate-bounce-in {
          animation: bounce-in 1s cubic-bezier(0.36, 0, 0.66, 1) 0.5s both;
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes slide-in-bottom {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
