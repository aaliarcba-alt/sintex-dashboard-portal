import { NextRequest, NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only admins (access_level 1) can reset other users' passwords
    if (session.user.access_level > 1) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });
    }

    const { user_id, new_password } = await req.json();

    if (!user_id || !new_password) {
      return NextResponse.json({ error: 'user_id and new_password are required' }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = await getDb();

    // Confirm target user exists and is active
    const check = await db.request()
      .input('user_id', sql.Int, user_id)
      .query(`SELECT user_id, username FROM digital.[User] WHERE user_id = @user_id AND is_active = 1`);

    if (check.recordset.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = check.recordset[0];

    // Update password
    await db.request()
      .input('user_id', sql.Int, user_id)
      .input('new_password', sql.NVarChar, new_password)
      .query(`
        UPDATE digital.[User]
        SET password_hash = @new_password,
            updated_at = SYSUTCDATETIME()
        WHERE user_id = @user_id
      `);

    // Audit log
    await db.request()
      .input('admin_id', sql.Int, session.user.user_id)
      .input('action', sql.NVarChar, 'ADMIN_PASSWORD_RESET')
      .input('details', sql.NVarChar, `Admin ${session.user.username} reset password for user: ${targetUser.username}`)
      .query(`
        INSERT INTO digital.Audit_Log (user_id, action, details, created_at)
        VALUES (@admin_id, @action, @details, SYSUTCDATETIME())
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}