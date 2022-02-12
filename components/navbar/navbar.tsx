import React from "react";
import { Nav, Button } from "react-bootstrap";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

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
              <li className="nav-item active">
                <Link href="/">
                  <a className="nav-link">Pending content</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/articles">
                  <a className="nav-link">User control</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/write">
                  <a className="nav-link">Notifications</a>
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
                    ? signOut({ redirect: false })
                    : router.push("/login")
                }
                className="nav-link"
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
