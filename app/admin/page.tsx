import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Editor } from '@/components/editor/Editor';
import { getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Editor', robots: { index: false } };

export default async function Admin() {
  const user = await getUser();
  if (!user) redirect('/admin/login');
  return <Editor user={user} />;
}
