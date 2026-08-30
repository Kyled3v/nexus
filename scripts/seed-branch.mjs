import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const id = crypto.randomUUID();
await sql`
  INSERT INTO branches (id, organisation_id, name, code, is_head_office, address, contact, status, created_at, updated_at)
  VALUES (${id}, ${"a7653cb5-0adb-4ec5-83dc-af868f7e4e8f"}, ${"KD SS - Main Branch"}, ${"MAIN"}, ${true}, ${{}}::jsonb, ${{}}::jsonb, ${"active"}, NOW(), NOW())
`;
console.log("Branch created:", id);
