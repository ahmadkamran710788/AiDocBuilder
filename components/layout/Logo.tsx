import Link from 'next/link';

export function Logo({ tag = 'Docs' }: { tag?: string }) {
  return (
    <>
      <Link className="logo" href="/" aria-label="AIDocBuilder documentation home">
        <span className="ai">AI</span>DocBuilder
      </Link>
      <span className="logo-tag">{tag}</span>
    </>
  );
}
