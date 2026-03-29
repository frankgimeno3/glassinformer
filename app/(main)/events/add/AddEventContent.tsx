"use client";

import Link from "next/link";

const AddEventContent = () => {
  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Add your event</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
        <p>
          You need an account to create or list an event on GlassInformer. Sign in
          if you already have one, or sign up to register.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 mt-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </article>
  );
};

export default AddEventContent;
