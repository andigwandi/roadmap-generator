// components/Header.tsx
import React from "react";
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
      <style jsx>{`
        header {
          padding: 1rem;
          background: #333;
          color: white;
        }
        nav ul {
          list-style: none;
          display: flex;
          gap: 1rem;
        }
        nav a {
          color: white;
          text-decoration: none;
        }
        nav a:hover {
          text-decoration: underline;
        }
      `}</style>
    </header>
  );
};

export default Header;
