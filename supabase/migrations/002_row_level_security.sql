-- NEXUS Row Level Security
-- Enforces tenant isolation at the database level.
-- No user can access another organisation's data.

-- ============================================================
-- HELPER FUNCTION — get current user organisation
-- ============================================================
create or replace function get_user_organisation_id()
returns uuid language sql security definer stable as _write.py
  select organisation_id from user_profiles where id = auth.uid();
_write.py;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
alter table organisations          enable row level security;
alter table branches               enable row level security;
alter table module_entitlements    enable row level security;
alter table user_profiles          enable row level security;
alter table categories             enable row level security;
alter table brands                 enable row level security;
alter table suppliers              enable row level security;
alter table products               enable row level security;
alter table inventory              enable row level security;
alter table inventory_movements    enable row level security;
alter table customers              enable row level security;
alter table leads                  enable row level security;
alter table till_sessions          enable row level security;
alter table sales                  enable row level security;
alter table sale_items             enable row level security;
alter table purchase_orders        enable row level security;
alter table purchase_order_items   enable row level security;
alter table automation_rules       enable row level security;
alter table automation_executions  enable row level security;
alter table audit_logs             enable row level security;
alter table notifications          enable row level security;

-- ============================================================
-- ORGANISATIONS — users see only their own organisation
-- ============================================================
create policy "organisations_select" on organisations
  for select using (id = get_user_organisation_id());

create policy "organisations_update" on organisations
  for update using (id = get_user_organisation_id());

-- ============================================================
-- BRANCHES — scoped to organisation
-- ============================================================
create policy "branches_select" on branches
  for select using (organisation_id = get_user_organisation_id());

create policy "branches_insert" on branches
  for insert with check (organisation_id = get_user_organisation_id());

create policy "branches_update" on branches
  for update using (organisation_id = get_user_organisation_id());

-- ============================================================
-- USER PROFILES — users see only profiles in their organisation
-- ============================================================
create policy "user_profiles_select" on user_profiles
  for select using (organisation_id = get_user_organisation_id());

create policy "user_profiles_update_own" on user_profiles
  for update using (id = auth.uid());

-- ============================================================
-- MODULE ENTITLEMENTS
-- ============================================================
create policy "module_entitlements_select" on module_entitlements
  for select using (organisation_id = get_user_organisation_id());

-- ============================================================
-- PRODUCTS
-- ============================================================
create policy "products_select" on products
  for select using (organisation_id = get_user_organisation_id());

create policy "products_insert" on products
  for insert with check (organisation_id = get_user_organisation_id());

create policy "products_update" on products
  for update using (organisation_id = get_user_organisation_id());

-- ============================================================
-- CATEGORIES & BRANDS
-- ============================================================
create policy "categories_select" on categories
  for select using (organisation_id = get_user_organisation_id());

create policy "categories_insert" on categories
  for insert with check (organisation_id = get_user_organisation_id());

create policy "brands_select" on brands
  for select using (organisation_id = get_user_organisation_id());

create policy "brands_insert" on brands
  for insert with check (organisation_id = get_user_organisation_id());

-- ============================================================
-- SUPPLIERS
-- ============================================================
create policy "suppliers_select" on suppliers
  for select using (organisation_id = get_user_organisation_id());

create policy "suppliers_insert" on suppliers
  for insert with check (organisation_id = get_user_organisation_id());

create policy "suppliers_update" on suppliers
  for update using (organisation_id = get_user_organisation_id());

-- ============================================================
-- INVENTORY
-- ============================================================
create policy "inventory_select" on inventory
  for select using (organisation_id = get_user_organisation_id());

create policy "inventory_insert" on inventory
  for insert with check (organisation_id = get_user_organisation_id());

create policy "inventory_update" on inventory
  for update using (organisation_id = get_user_organisation_id());

create policy "inventory_movements_select" on inventory_movements
  for select using (organisation_id = get_user_organisation_id());

create policy "inventory_movements_insert" on inventory_movements
  for insert with check (organisation_id = get_user_organisation_id());

-- ============================================================
-- CUSTOMERS
-- ============================================================
create policy "customers_select" on customers
  for select using (organisation_id = get_user_organisation_id());

create policy "customers_insert" on customers
  for insert with check (organisation_id = get_user_organisation_id());

create policy "customers_update" on customers
  for update using (organisation_id = get_user_organisation_id());

-- ============================================================
-- LEADS
-- ============================================================
create policy "leads_select" on leads
  for select using (organisation_id = get_user_organisation_id());

create policy "leads_insert" on leads
  for insert with check (organisation_id = get_user_organisation_id());

create policy "leads_update" on leads
  for update using (organisation_id = get_user_organisation_id());

-- ============================================================
-- SALES
-- ============================================================
create policy "till_sessions_select" on till_sessions
  for select using (organisation_id = get_user_organisation_id());

create policy "till_sessions_insert" on till_sessions
  for insert with check (organisation_id = get_user_organisation_id());

create policy "till_sessions_update" on till_sessions
  for update using (organisation_id = get_user_organisation_id());

create policy "sales_select" on sales
  for select using (organisation_id = get_user_organisation_id());

create policy "sales_insert" on sales
  for insert with check (organisation_id = get_user_organisation_id());

create policy "sales_update" on sales
  for update using (organisation_id = get_user_organisation_id());

create policy "sale_items_select" on sale_items
  for select using (
    sale_id in (select id from sales where organisation_id = get_user_organisation_id())
  );

create policy "sale_items_insert" on sale_items
  for insert with check (
    sale_id in (select id from sales where organisation_id = get_user_organisation_id())
  );

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
create policy "purchase_orders_select" on purchase_orders
  for select using (organisation_id = get_user_organisation_id());

create policy "purchase_orders_insert" on purchase_orders
  for insert with check (organisation_id = get_user_organisation_id());

create policy "purchase_orders_update" on purchase_orders
  for update using (organisation_id = get_user_organisation_id());

create policy "purchase_order_items_select" on purchase_order_items
  for select using (
    purchase_order_id in (select id from purchase_orders where organisation_id = get_user_organisation_id())
  );

create policy "purchase_order_items_insert" on purchase_order_items
  for insert with check (
    purchase_order_id in (select id from purchase_orders where organisation_id = get_user_organisation_id())
  );

-- ============================================================
-- AUTOMATION
-- ============================================================
create policy "automation_rules_select" on automation_rules
  for select using (organisation_id = get_user_organisation_id());

create policy "automation_rules_insert" on automation_rules
  for insert with check (organisation_id = get_user_organisation_id());

create policy "automation_rules_update" on automation_rules
  for update using (organisation_id = get_user_organisation_id());

create policy "automation_executions_select" on automation_executions
  for select using (organisation_id = get_user_organisation_id());

create policy "automation_executions_insert" on automation_executions
  for insert with check (organisation_id = get_user_organisation_id());

-- ============================================================
-- AUDIT LOGS — insert only, no update/delete
-- ============================================================
create policy "audit_logs_select" on audit_logs
  for select using (organisation_id = get_user_organisation_id());

create policy "audit_logs_insert" on audit_logs
  for insert with check (organisation_id = get_user_organisation_id());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create policy "notifications_select" on notifications
  for select using (
    organisation_id = get_user_organisation_id() and
    (user_id is null or user_id = auth.uid())
  );

create policy "notifications_update_own" on notifications
  for update using (
    organisation_id = get_user_organisation_id() and
    (user_id is null or user_id = auth.uid())
  );
