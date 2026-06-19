// app/api/favourites/route.ts
// GET  → returns array of app_ids favourited by the logged-in user
// POST → toggles a favourite (add if missing, remove if exists)

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

import { getDb as getDbPool, sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const pool = await getDbPool();
    const result = await pool.request()
      .input('user_id', sql.Int, session.user.user_id)
      .query(`
        SELECT app_id
        FROM digital.User_Favourite
        WHERE user_id = @user_id
      `);

    const favouriteIds: number[] = result.recordset.map((r: { app_id: number }) => r.app_id);
    return NextResponse.json({ favourites: favouriteIds });
  } catch (err) {
    console.error('GET /api/favourites error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { app_id } = await req.json();
    if (!app_id || typeof app_id !== 'number') {
      return NextResponse.json({ error: 'app_id required' }, { status: 400 });
    }

    const pool = await getDbPool();

    // Check if already favourited
    const existing = await pool.request()
      .input('user_id', sql.Int, session.user.user_id)
      .input('app_id', sql.Int, app_id)
      .query(`
        SELECT fav_id FROM digital.User_Favourite
        WHERE user_id = @user_id AND app_id = @app_id
      `);

    if (existing.recordset.length > 0) {
      // Already exists → remove
      await pool.request()
        .input('user_id', sql.Int, session.user.user_id)
        .input('app_id', sql.Int, app_id)
        .query(`
          DELETE FROM digital.User_Favourite
          WHERE user_id = @user_id AND app_id = @app_id
        `);
      return NextResponse.json({ action: 'removed', app_id });
    } else {
      // Does not exist → add
      await pool.request()
        .input('user_id', sql.Int, session.user.user_id)
        .input('app_id', sql.Int, app_id)
        .query(`
          INSERT INTO digital.User_Favourite (user_id, app_id)
          VALUES (@user_id, @app_id)
        `);
      return NextResponse.json({ action: 'added', app_id });
    }
  } catch (err) {
    console.error('POST /api/favourites error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}