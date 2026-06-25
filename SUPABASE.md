# Connect Welth to Supabase

Your project in the dashboard:

| Field | Value |
|--------|--------|
| Name | welth |
| Project ref | `briialrbgnrnzpxxvssj` |
| API URL | `https://briialrbgnrnzpxxvssj.supabase.co` |
| Region | Sydney (`ap-southeast-2`) |

## Steps in Supabase UI

1. Open your project → click **Connect** (top bar).
2. Choose **ORMs** → **Prisma**.
3. Copy **DATABASE_URL** (Transaction pooler, port 6543).
4. Copy **DIRECT_URL** (Session pooler or direct, port 5432).
5. If you do not know the database password, click **Reset database password** on that screen and copy the new one.

## Update this app

In `C:\dev\welth2` (where you run `npm run dev`):

1. Edit `.env` — comment SQLite, paste the two Supabase URLs.
2. Replace `prisma/schema.prisma` with the contents of `prisma/schema.postgresql.prisma`.
3. Run:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

4. In Supabase → **Table Editor**, you should see `User`, `Account`, and `Transaction` tables.

## Why the old connection failed

- Host used `aws-1-ap-southeast-2`; your project uses **`aws-0-ap-southeast-2`**.
- Error `tenant/user postgres.briialrbgnrnzpxxvssj not found` usually means **wrong or outdated database password** — always copy fresh strings from **Connect**.

Until Supabase is wired up, the app keeps using **SQLite** (`prisma/dev.db`) so localhost still works.
