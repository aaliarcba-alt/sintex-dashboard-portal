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

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const db = await getDb();

    // Verify current password
    const check = await db.request()
      .input('user_id', sql.Int, session.user.user_id)
      .input('current_password', sql.NVarChar, currentPassword)
      .query(`
        SELECT user_id FROM digital.[User]
        WHERE user_id = @user_id
          AND password_hash = @current_password
          AND is_active = 1
      `);

    if (check.recordset.length === 0) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Update to new password
    await db.request()
      .input('user_id', sql.Int, session.user.user_id)
      .input('new_password', sql.NVarChar, newPassword)
      .query(`
        UPDATE digital.[User]
        SET password_hash = @new_password,
            updated_at = SYSUTCDATETIME()
        WHERE user_id = @user_id
      `);

    // Log the password change in Audit_Log
    await db.request()
      .input('user_id', sql.Int, session.user.user_id)
      .input('action', sql.NVarChar, 'PASSWORD_CHANGE')
      .input('details', sql.NVarChar, 'User changed their own password')
      .query(`
        INSERT INTO digital.Audit_Log (user_id, action, details, created_at)
        VALUES (@user_id, @action, @details, SYSUTCDATETIME())
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}