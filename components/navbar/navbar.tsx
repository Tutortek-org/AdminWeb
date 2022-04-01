import React from "react";
import { Nav, Button } from "react-bootstrap";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/dist/client/router";

export default function Navbar() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <Nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-xl">
        <Link href="/">
          <a className="navbar-brand">Tutortek-Admin</a>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarsExample07XL"
          aria-controls="navbarsExample07XL"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-between"
          id="navbarsExample07XL"
        >
          {isAuthenticated ? (
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link href="/topics">
                  <a className="nav-link">Pending topics</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/materials">
                  <a className="nav-link">Pending materials</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/users">
                  <a className="nav-link">User control</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/notifications">
                  <a className="nav-link">Notifications</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/statistics">
                  <a className="nav-link">Statistics</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/bug_reports">
                  <a className="nav-link">Bug reports</a>
                </Link>
              </li>
            </ul>
          ) : (
            <span />
          )}
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap">
              <Button
                onClick={() =>
                  isAuthenticated
                    ? signOut({ redirect: false }).then(() => router.push("/"))
                    : router.push("/login")
                }
                variant={isAuthenticated ? "danger" : "primary"}
              >
                {isAuthenticated ? "Log out" : "Login"}
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </Nav>
  );
}
