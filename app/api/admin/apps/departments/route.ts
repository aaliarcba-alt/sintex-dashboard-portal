import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user || session.user.access_level > 1)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const db = await getDb();
    const result = await db.request().query(`
      SELECT dept_id, dept_name, subdivision
      FROM digital.Department
      ORDER BY dept_name, subdivision
    `);
    return NextResponse.json({ depts: result.recordset });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}