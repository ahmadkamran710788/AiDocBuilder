import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/layout/Logo';
import { authConfigured, getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Editor sign-in', robots: { index: false } };

export default async function Login() {
  if (await getUser()) redirect('/admin');
  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Logo tag="Editor" />
        </div>
      </header>
      <div className="login">
        {authConfigured() ? (
          <LoginForm />
        ) : (
          <form>
            <h1>Sign-in is not set up</h1>
            <p>
              Set <code>SESSION_SECRET</code>, <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> on the server, then restart it.
            </p>
          </form>
        )}
      </div>
    </>
  );
}
