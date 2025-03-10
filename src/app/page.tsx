'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24 flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Emergency Response Made Faster
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                Get real-time tracking of emergency vehicles and share your location for quicker response times.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/login">
                  <Button variant="emergency">
                    Get Started
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="bg-white">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <img
                src="/emergency-hero.svg"
                alt="Emergency Response"
                className="max-h-96 w-full object-contain"
              />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
              <p className="mt-4 text-xl text-gray-600">How our service helps during emergencies</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Real-time Location Sharing</h3>
                <p className="mt-2 text-gray-600">
                  Share your exact location with emergency responders for faster assistance.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Vehicle Tracking</h3>
                <p className="mt-2 text-gray-600">
                  View nearby emergency vehicles on a map and get estimated arrival times.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Fast Response</h3>
                <p className="mt-2 text-gray-600">
                  Our system optimizes dispatching to ensure the fastest possible emergency response.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Sign up for free and experience how our platform can help in emergencies.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button variant="primary">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-center">
          <div className="mb-4 lg:mb-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} EmergencyTrack. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 