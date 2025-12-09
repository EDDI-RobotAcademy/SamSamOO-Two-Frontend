"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
      <Image
        src="/samsam.svg"
        alt="Next.js Logo"
        width={120}
        height={40}
        className="dark:invert mb-8"
        priority
      />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome to SAMSAMOO 👋
      </h1>
      <Link
        href="/login"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Login
      </Link>
    </div>
  );
}
