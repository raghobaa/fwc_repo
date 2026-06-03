import React from "react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t pt-6 pb-4 text-center text-gray-500 text-sm bg-gray-50">
      <p>
        © {new Date().getFullYear()} <strong>HRMS System</strong> — Empowering
        smart workforce management.
      </p>
      <p className="mt-1">
        Designed for modern HR teams |{" "}
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 hover:underline"
        >
          Contact Support
        </a>
      </p>
    </footer>
  );
}
