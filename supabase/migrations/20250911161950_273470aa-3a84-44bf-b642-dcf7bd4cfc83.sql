-- Allow barman staff to view order items
create policy "Barman staff can view order items"
on public.order_items
for select
using (has_role(auth.uid(), 'barman_staff'));

-- Allow barman roles to view pharmacies (to display pharmacy names in dashboards)
create policy "Barman roles can view pharmacies"
on public.pharmacies
for select
using (
  has_role(auth.uid(), 'barman_staff') OR
  has_role(auth.uid(), 'barman_manager') OR
  has_role(auth.uid(), 'barman_accountant') OR
  has_role(auth.uid(), 'admin')
);