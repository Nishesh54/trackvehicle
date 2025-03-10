'use client';

import React from 'react';
import Header from '../../components/Header';
import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <RegisterForm />
      </div>
    </div>
  );
} 