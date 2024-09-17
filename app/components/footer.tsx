// components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer>
      <p>
        &copy; {new Date().getFullYear()} My Next.js App. All rights reserved.
      </p>
      <style jsx>{`
        footer {
          padding: 1rem;
          background: #333;
          color: white;
          text-align: center;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
