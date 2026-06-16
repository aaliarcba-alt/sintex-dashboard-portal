import { NextRequest, NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT u.user_id, u.username, u.email, u.dept_id,
               r.role_name, r.access_level
        FROM digital.[User] u
        LEFT JOIN digital.User_Role_Mapping urm ON u.user_id = urm.user_id AND urm.is_active = 1
        LEFT JOIN digital.Role r ON urm.role_id = r.role_id AND r.is_active = 1
        WHERE u.email = @email
          AND u.password_hash = @password
          AND u.is_active = 1
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = result.recordset[0];

    await db.request()
      .input('user_id', sql.Int, user.user_id)
      .query(`UPDATE digital.[User] SET last_login = SYSUTCDATETIME() WHERE user_id = @user_id`);

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role_name: user.role_name || 'Viewer',
      access_level: user.access_level || 3,
      dept_id: user.dept_id,
    };
    await session.save();

    return NextResponse.json({ success: true, user: session.user });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
