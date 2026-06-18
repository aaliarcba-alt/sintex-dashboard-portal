import { NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { user_id, access_level } = session.user;

    let result;

    // access_level <= 2: Admin, CEO, MD, CDO — see all apps
    if (access_level <= 2) {
      result = await db.request().query(`
        SELECT a.app_id, a.app_name, a.app_type, a.app_status,
               a.description, a.thumbnail_url, a.url_link, a.tags,
               d.dept_name, d.subdivision,
               1 as can_view, 1 as can_export, 1 as can_embed
        FROM digital.Application a
        LEFT JOIN digital.Department d ON a.dept_id = d.dept_id
        WHERE a.is_active = 1
        ORDER BY a.app_name
      `);
    } else {
      // Role-based: parameterised query — no SQL injection risk
      result = await db.request()
        .input('user_id', sql.Int, user_id)
        .query(`
          SELECT DISTINCT
                 a.app_id, a.app_name, a.app_type, a.app_status,
                 a.description, a.thumbnail_url, a.url_link, a.tags,
                 d.dept_name, d.subdivision,
                 ara.can_view, ara.can_export, ara.can_embed
          FROM digital.Application a
          LEFT JOIN digital.Department d ON a.dept_id = d.dept_id
          INNER JOIN digital.App_Role_Access ara ON a.app_id = ara.app_id
          INNER JOIN digital.User_Role_Mapping urm ON ara.role_id = urm.role_id
          WHERE urm.user_id = @user_id
            AND urm.is_active = 1
            AND ara.can_view = 1
            AND ara.revoked_at IS NULL
            AND a.is_active = 1
          ORDER BY a.app_name
        `);
    }

    const apps = result.recordset.map((row: any) => ({
      app_id: row.app_id,
      app_name: row.app_name,
      app_type: row.app_type,
      app_status: row.app_status,
      description: row.description,
      thumbnail_url: row.thumbnail_url,
      url_link: row.url_link,
      tags: row.tags ? JSON.parse(row.tags) : [],
      dept_name: row.dept_name,
      subdivision: row.subdivision,
      can_view: row.can_view,
      can_export: row.can_export,
      can_embed: row.can_embed,
    }));

    return NextResponse.json({ apps });
  } catch (err) {
    console.error('Apps fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}