create type public.app_role as enum ('admin','moderator','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.categories (id text primary key, name text not null, description text, sort_order int not null default 0, image_key text);
grant select on public.categories to anon, authenticated; grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "admin manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.menu_items (
 id text primary key, category_id text not null references public.categories(id), name text not null, description text not null default '',
 ingredients text[] not null default '{}', price int not null, image_key text not null default 'masala', is_veg boolean not null default true,
 spicy_level int not null default 0, is_popular boolean not null default false, is_bestseller boolean not null default false,
 is_available boolean not null default true, rating numeric(2,1) not null default 4.5, customizable boolean not null default true,
 created_at timestamptz not null default now());
grant select on public.menu_items to anon, authenticated; grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "public read menu" on public.menu_items for select to anon, authenticated using (true);
create policy "admin manage menu" on public.menu_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.addons (id text primary key, name text not null, price int not null, sort_order int not null default 0);
grant select on public.addons to anon, authenticated; grant all on public.addons to service_role;
alter table public.addons enable row level security;
create policy "public read addons" on public.addons for select to anon, authenticated using (true);
create policy "admin manage addons" on public.addons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.coupons (code text primary key, description text not null, kind text not null check (kind in ('percent','flat')), value int not null, min_subtotal int not null default 0, max_discount int, first_order_only boolean not null default false, active boolean not null default true);
grant all on public.coupons to service_role; grant select on public.coupons to authenticated;
alter table public.coupons enable row level security;
create policy "admin manage coupons" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text, preferred_payment text, created_at timestamptz not null default now());
grant select, insert, update on public.profiles to authenticated; grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id, full_name, phone) values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.addresses (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, label text not null default 'Home', line1 text not null, city text not null, pincode text not null, created_at timestamptz not null default now());
grant select, insert, update, delete on public.addresses to authenticated; grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.orders (
 id uuid primary key default gen_random_uuid(), order_number text not null unique, user_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'placed' check (status in ('placed','preparing','out_for_delivery','delivered','cancelled')),
 fulfilment text not null, payment_method text not null, payment_status text not null default 'pending',
 customer jsonb not null, items jsonb not null, subtotal int not null, discount int not null default 0, delivery_fee int not null default 0, taxes int not null default 0, total int not null,
 coupon_code text, created_at timestamptz not null default now());
grant select on public.orders to authenticated; grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

insert into public.categories(id,name,description,sort_order,image_key) values
('classic','Classic Dosas','Thin, golden and timeless',1,'plain'),
('masala','Masala Dosas','Stuffed with spiced potato palya',2,'masala'),
('cheese','Cheese Dosas','Melty, gooey, loved by kids',3,'cheese'),
('paneer','Paneer Dosas','Cottage cheese, every way',4,'paneer'),
('signature','Signature Dosas','Our chef''s Bengaluru specials',5,'signature'),
('mysore','Mysore Dosas','Red chutney, fiery and bold',6,'mysore'),
('set','Set Dosa','Soft, spongy stacks of three',7,'set'),
('rava','Rava Dosa','Lacy semolina crispness',8,'rava'),
('combo','Family & Combo Meals','Share the table',9,'combo'),
('beverages','Beverages','Filter kaapi and coolers',10,'coffee'),
('extras','Chutneys & Extras','Sides to complete the plate',11,'chutney');

insert into public.menu_items(id,category_id,name,description,ingredients,price,image_key,spicy_level,is_popular,is_bestseller,rating,customizable) values
('plain-dosa','classic','Plain Dosa','Paper-thin fermented rice and urad crepe, roasted till golden.','{rice,urad dal,ghee}',70,'plain',0,false,false,4.4,true),
('butter-plain','classic','Benne Plain Dosa','Classic dosa brushed generously with Amul butter.','{rice,urad dal,butter}',90,'plain',0,true,false,4.6,true),
('ghee-roast','classic','Ghee Roast','Extra-long, crackling crisp, roasted in pure ghee.','{rice,urad dal,ghee}',120,'plain',0,true,true,4.8,true),
('masala-dosa','masala','Masala Dosa','Crisp dosa with turmeric potato palya, onions and curry leaves.','{potato,onion,curry leaves,mustard}',99,'masala',1,true,true,4.8,true),
('benne-masala','masala','Benne Masala Dosa','Davangere-style, soaked in butter with soft potato filling.','{potato,butter,onion}',129,'masala',1,true,true,4.9,true),
('onion-masala','masala','Onion Masala Dosa','Caramelised onions and green chilli over classic masala.','{onion,green chilli,potato}',115,'masala',2,false,false,4.5,true),
('cheese-dosa','cheese','Cheese Dosa','Crisp dosa layered with melted mozzarella.','{mozzarella,rice,urad dal}',140,'cheese',0,true,false,4.6,true),
('cheese-masala','cheese','Cheese Masala Dosa','Potato masala meets a blanket of cheese.','{mozzarella,potato,onion}',160,'cheese',1,false,true,4.7,true),
('cheese-chilli','cheese','Chilli Cheese Dosa','Cheese with green chilli and capsicum for a kick.','{mozzarella,green chilli,capsicum}',170,'cheese',3,false,false,4.5,true),
('paneer-dosa','paneer','Paneer Dosa','Grated spiced paneer folded into a golden dosa.','{paneer,onion,coriander}',160,'paneer',1,true,false,4.6,true),
('paneer-tikka','paneer','Paneer Tikka Dosa','Tandoori paneer chunks with mint mayo drizzle.','{paneer,tikka masala,mint}',189,'paneer',2,false,true,4.7,true),
('paneer-butter','paneer','Paneer Butter Masala Dosa','Rich makhani gravy and paneer, a north-south fusion.','{paneer,tomato,butter,cream}',199,'paneer',1,false,false,4.5,true),
('bengaluru-special','signature','Bengaluru Special Dosa','Our house favourite: podi, butter, masala and coconut chutney inside.','{podi,butter,potato,coconut}',179,'signature',2,true,true,4.9,true),
('podi-ghee','signature','Gunpowder Ghee Dosa','Fiery milagai podi with ghee painted across the dosa.','{podi,ghee,sesame}',149,'signature',3,true,false,4.7,true),
('schezwan','signature','Schezwan Spring Dosa','Indo-Chinese street favourite with crunchy veggies.','{cabbage,carrot,schezwan sauce}',169,'signature',3,false,false,4.4,true),
('mysore-masala','mysore','Mysore Masala Dosa','Red garlic chutney smeared inside with potato masala.','{red chilli,garlic,potato}',129,'mysore',3,true,true,4.8,true),
('mysore-plain','mysore','Mysore Plain Dosa','The red chutney classic without the potato.','{red chilli,garlic}',109,'mysore',3,false,false,4.5,true),
('set-dosa','set','Set Dosa','Three soft, spongy dosas with sagu and chutney.','{rice,poha,sagu}',99,'set',1,true,false,4.6,true),
('butter-set','set','Benne Set Dosa','Set dosa crowned with a dollop of butter.','{rice,poha,butter}',119,'set',1,false,false,4.6,true),
('rava-dosa','rava','Rava Dosa','Lacy semolina crepe with cumin, pepper and ginger.','{semolina,cumin,pepper,ginger}',110,'rava',1,false,false,4.5,true),
('onion-rava','rava','Onion Rava Masala','Rava dosa with onions and potato masala.','{semolina,onion,potato}',135,'rava',2,true,false,4.7,true),
('family-combo','combo','Family Feast (4)','Four dosas of your choice, 2 vadas, 4 filter coffees, chutneys and sambar.','{assorted}',549,'combo',1,true,true,4.8,false),
('duo-combo','combo','Dosa Duo Combo','Two masala dosas, one vada and two filter coffees.','{potato,vada,coffee}',299,'combo',1,false,false,4.7,false),
('filter-coffee','beverages','Filter Kaapi','Strong chicory decoction with frothy hot milk, served in dabara.','{coffee,chicory,milk}',40,'coffee',0,true,true,4.9,false),
('masala-chai','beverages','Masala Chai','Ginger-cardamom spiced milk tea.','{tea,ginger,cardamom}',35,'coffee',0,false,false,4.5,false),
('buttermilk','beverages','Neer Majjige','Spiced buttermilk with curry leaves and ginger.','{curd,ginger,curry leaves}',45,'coffee',0,false,false,4.6,false),
('coconut-chutney','extras','Extra Coconut Chutney','Fresh-ground coconut chutney.','{coconut,green chilli}',20,'chutney',0,false,false,4.5,false),
('sambar-bowl','extras','Sambar Bowl','Lentil-vegetable sambar with drumstick.','{toor dal,drumstick,tamarind}',40,'chutney',1,false,false,4.6,false),
('medu-vada','extras','Medu Vada (2)','Crisp lentil doughnuts.','{urad dal,pepper}',60,'chutney',0,true,false,4.7,false);

insert into public.addons(id,name,price,sort_order) values
('butter','Extra butter',20,1),('cheese','Extra cheese',35,2),('paneer','Extra paneer',45,3),('chutney','Extra chutney',15,4),('sambar','Extra sambar',20,5);

insert into public.coupons(code,description,kind,value,min_subtotal,max_discount,first_order_only) values
('DOSA10','10% off on orders above ₹199','percent',10,199,100,false),
('FIRSTORDER','₹75 off your first order','flat',75,249,null,true),
('BENGALURU20','20% off on orders above ₹499','percent',20,499,200,false);