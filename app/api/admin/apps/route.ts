import { NextRequest, NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user || session.user.access_level > 1) return null;
  return session.user;
}

export async function GET() {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const db = await getDb();
    const result = await db.request().query(`
      SELECT a.*, d.dept_name
      FROM digital.Application a
      LEFT JOIN digital.Department d ON a.dept_id = d.dept_id
      ORDER BY a.app_id
    `);
    return NextResponse.json({ apps: result.recordset });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { app_name, app_type, dept_id, app_status, description, url_link, tags } = body;

    const db = await getDb();
    await db.request()
      .input('app_name', sql.NVarChar, app_name)
      .input('app_type', sql.NVarChar, app_type || 'Dashboard')
      .input('dept_id', sql.Int, dept_id || null)
      .input('app_status', sql.NVarChar, app_status || 'Live')
      .input('description', sql.NVarChar, description || null)
      .input('url_link', sql.VarChar, url_link || null)
      .input('tags', sql.NVarChar, tags ? JSON.stringify(tags) : null)
      .query(`
        INSERT INTO digital.Application (app_name, app_type, dept_id, app_status, description, url_link, tags, is_active)
        VALUES (@app_name, @app_type, @dept_id, @app_status, @description, @url_link, @tags, 1)
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { app_id, app_name, app_status, description, url_link, is_active } = body;

    const db = await getDb();
    await db.request()
      .input('app_id', sql.Int, app_id)
      .input('app_name', sql.NVarChar, app_name)
      .input('app_status', sql.NVarChar, app_status)
      .input('description', sql.NVarChar, description || null)
      .input('url_link', sql.VarChar, url_link || null)
      .input('is_active', sql.Bit, is_active ? 1 : 0)
      .query(`
        UPDATE digital.Application
        SET app_name = @app_name,
            app_status = @app_status,
            description = @description,
            url_link = @url_link,
            is_active = @is_active,
            updated_at = SYSUTCDATETIME()
        WHERE app_id = @app_id
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
