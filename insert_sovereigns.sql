-- 29 Gold Sovereigns — John Flynn (user_id 42)
-- Imported from CoinSnap export 21 July 2026
-- Run with: psql "$(grep DATABASE_URL /mnt/d/MIM/backend/.env | cut -d= -f2-)" -f /mnt/d/MIM/insert_sovereigns.sql

INSERT INTO holdings (user_id, metal_type, category, name, quantity, weight_grams, purity, purchase_price, purchase_date, graded, grade_cert, notes, is_listed, in_gallery, subcategory)
VALUES
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2013 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1002.1. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2014 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1002.1. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2013 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1002.1. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2013 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1002.1. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2018 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1332. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '2013 Gold Sovereign (India Mint)', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Saint George and the Dragon. KM# 1002. Mintmark: I. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1966 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'St. George and the Dragon. KM# 908. Grade: MS.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1888 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Jubilee Head. KM# 767. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1888 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Jubilee Head. KM# 767. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1889 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Jubilee Head. KM# 767. Grade: XF.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1890 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Jubilee Head. KM# 767. Grade: XF.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1891 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Jubilee Head. KM# 767. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1889 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Jubilee Head. KM# 767. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1893 Gold Sovereign (Australia)', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Melbourne Mint. KM# 13. Grade: VF.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1908 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Edward VII. KM# 805. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1907 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Edward VII. KM# 805. Grade: F.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1910 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Edward VII. KM# 805. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1907 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'Edward VII. KM# 805. Grade: F.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1917 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'George V. KM# 820. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1917 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'George V. KM# 820. Grade: AU.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1925 Gold Sovereign', 1, 7.98, 0.9167, NULL, NULL, false, NULL, 'George V. KM# 820. Grade: VF.', false, false, 'bullion'),
(42, 'gold', 'sovereign', '1893 Gold Sovereign (Australia - Melbourne)', 1, 7.32, 0.9167, NULL, NULL, false, NULL, 'Melbourne Mint. KM# 13. Grade: VF. Weight per CoinSnap: 7.33g.', false, false, 'bullion');
