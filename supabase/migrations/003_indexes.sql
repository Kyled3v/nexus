-- NEXUS Performance Indexes
-- Indexes on foreign keys and common query patterns

create index idx_branches_org on branches(organisation_id);
create index idx_products_org on products(organisation_id);
create index idx_products_sku on products(organisation_id, sku);
create index idx_products_barcode on products(barcode) where barcode is not null;
create index idx_products_category on products(category_id);
create index idx_products_supplier on products(supplier_id);
create index idx_inventory_org_branch on inventory(organisation_id, branch_id);
create index idx_inventory_product on inventory(product_id);
create index idx_inventory_movements_org on inventory_movements(organisation_id);
create index idx_inventory_movements_product on inventory_movements(product_id);
create index idx_customers_org on customers(organisation_id);
create index idx_customers_email on customers(organisation_id, email) where email is not null;
create index idx_leads_org on leads(organisation_id);
create index idx_leads_stage on leads(organisation_id, stage);
create index idx_sales_org on sales(organisation_id);
create index idx_sales_branch on sales(branch_id);
create index idx_sales_customer on sales(customer_id) where customer_id is not null;
create index idx_sales_completed_at on sales(completed_at desc) where completed_at is not null;
create index idx_sale_items_sale on sale_items(sale_id);
create index idx_purchase_orders_org on purchase_orders(organisation_id);
create index idx_purchase_orders_supplier on purchase_orders(supplier_id);
create index idx_purchase_orders_status on purchase_orders(organisation_id, status);
create index idx_audit_logs_org on audit_logs(organisation_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on audit_logs(created_at desc);
create index idx_notifications_user on notifications(user_id) where user_id is not null;
create index idx_notifications_org_unread on notifications(organisation_id) where read = false;
create index idx_automation_rules_org on automation_rules(organisation_id);
create index idx_automation_executions_org on automation_executions(organisation_id);
create index idx_automation_executions_rule on automation_executions(rule_id);
