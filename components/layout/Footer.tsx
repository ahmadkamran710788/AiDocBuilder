import Link from 'next/link';

export function Footer({ productVersion }: { productVersion: string }) {
  return (
    <footer>
      <span>
        © {new Date().getFullYear()} AIDocBuilder · {productVersion}
      </span>
      <Link href="/admin">Editor sign-in</Link>
    </footer>
  );
}
