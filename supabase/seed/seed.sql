-- ========================================================
-- PALLETOORI'S DAIRY FARM - SEED DATA
-- ========================================================

-- Insert Categories
INSERT INTO public.categories (id, name, slug, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Fresh Milk', 'milk', 'Farm fresh raw whole milk delivered within 3 hours'),
('c2222222-2222-2222-2222-222222222222', 'Curd & Buttermilk', 'curd-buttermilk', 'Clay-pot set curd & spiced chaas'),
('c3333333-3333-3333-3333-333333333333', 'Ghee & Butter', 'ghee-butter', 'Pure Vedic Bilona Ghee & fresh white makkhan'),
('c4444444-4444-4444-4444-444444444444', 'Fresh Paneer', 'paneer', 'Handmade soft malai paneer'),
('c5555555-5555-5555-5555-555555555555', 'Farm Milkshakes', 'milkshakes', 'Thick fresh milkshakes with pure ingredients')
ON CONFLICT (slug) DO NOTHING;

-- Insert Delivery Slots
INSERT INTO public.delivery_slots (title, time_range, cutoff_time, is_active) VALUES
('Morning Fresh Delivery', '6:00 AM – 9:00 AM', 'Orders accepted until 9:00 PM previous night', true),
('Evening Comfort Delivery', '5:00 PM – 8:00 PM', 'Orders accepted until 2:00 PM same day', true);

-- Insert Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, is_active) VALUES
('PALLETOORI50', 'fixed', 50.00, 200.00, true),
('FARM20', 'percentage', 20.00, 150.00, true);

-- Insert Products
INSERT INTO public.products (id, category_id, name, slug, short_description, description, image_url, ingredients, shelf_life, fat_content, is_featured, is_active) VALUES
('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Pure Cow Milk', 'fresh-cow-milk', 'Unadulterated, whole raw cow milk delivered within 3 hours.', 'Chilled instantly to 4°C to preserve natural vitamins and sweetness.', '/milk.png', '100% Pure Cow Milk', '2 days refrigerated', '3.8% Natural Fat', true, true),
('p2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Rich Buffalo Milk', 'fresh-buffalo-milk', 'Thick, creamy buffalo milk with high natural fat.', 'Rich in calcium and healthy proteins from Murrah buffaloes.', '/milk.png', '100% Pure Buffalo Milk', '2 days refrigerated', '7.0% Natural Fat', true, true),
('p3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'Traditional Farm Curd (Dahi)', 'fresh-farm-curd', 'Thick, naturally set curd with active probiotic cultures.', 'Set using traditional mother-culture fermentation. No starch or gelatin.', '/Curd.png', 'Pure Milk, Probiotic Starter', '5 days refrigerated', '4.5% Fat', true, true),
('p4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Spiced Village Buttermilk (Chaas)', 'masala-buttermilk', 'Traditional hand-churned buttermilk tempered with roasted cumin.', 'Cooling, digestive buttermilk made by churning whole curd.', '/Buttermilk.png', 'Curd water, Rock salt, Jeera, Ginger', '3 days refrigerated', 'Light', false, true),
('p5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', 'Fresh Handcrafted Malai Paneer', 'fresh-malai-paneer', 'Melt-in-the-mouth artisanal cottage cheese made using lemon whey.', 'Soft and juicy paneer pressed gently in muslin cloth.', '/Paneer.png', 'Whole Milk, Lemon Whey', '4 days refrigerated', 'High Milk Solids', true, true),
('p6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'Pure Desi Danedar Bilona Ghee', 'traditional-bilona-ghee', 'Golden, fragrant ghee slowly clarified over firewood.', 'Prepared following the authentic Vedic Bilona method.', '/Ghee.png', '100% Clarified Butter Fat', '9 months', '99.7% Milk Fat', true, true),
('p7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'Farm Fresh White Butter (Makkhan)', 'fresh-white-butter', 'Unsalted, fresh white butter churned directly from cultured cream.', 'Pure Indian village makkhan without salt or coloring.', '/Butter.png', 'Cultured Milk Cream', '10 days refrigerated', '82% Fat', false, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Variants
INSERT INTO public.product_variants (product_id, name, price, original_price, stock, unit, is_available) VALUES
('p1111111-1111-1111-1111-111111111111', '500 ml', 38.00, 42.00, 120, 'ml', true),
('p1111111-1111-1111-1111-111111111111', '1 Litre', 72.00, 80.00, 95, 'L', true),
('p2222222-2222-2222-2222-222222222222', '500 ml', 45.00, 48.00, 80, 'ml', true),
('p2222222-2222-2222-2222-222222222222', '1 Litre', 88.00, 95.00, 65, 'L', true),
('p3333333-3333-3333-3333-333333333333', '500 g', 40.00, 45.00, 90, 'g', true),
('p3333333-3333-3333-3333-333333333333', '1 kg', 78.00, 85.00, 60, 'kg', true),
('p4444444-4444-4444-4444-444444444444', '200 ml Bottle', 18.00, 20.00, 150, 'ml', true),
('p4444444-4444-4444-4444-444444444444', '500 ml Bottle', 35.00, 40.00, 85, 'ml', true),
('p5555555-5555-5555-5555-555555555555', '250 g', 110.00, 125.00, 45, 'g', true),
('p5555555-5555-5555-5555-555555555555', '500 g', 210.00, 235.00, 35, 'g', true),
('p6666666-6666-6666-6666-666666666666', '250 ml Glass Jar', 280.00, 310.00, 40, 'ml', true),
('p6666666-6666-6666-6666-666666666666', '500 ml Glass Jar', 540.00, 590.00, 55, 'ml', true),
('p6666666-6666-6666-6666-666666666666', '1 Litre Glass Jar', 1050.00, 1150.00, 30, 'L', true),
('p7777777-7777-7777-7777-777777777777', '100 g', 65.00, 75.00, 50, 'g', true),
('p7777777-7777-7777-7777-777777777777', '500 g', 290.00, 325.00, 25, 'g', true);
