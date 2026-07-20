-- Medieval Gold Collection — John Flynn (user_id 42)
-- Acquired May 2026 from George (Sheepdoge), Donabate, via Adverts.ie
-- Run with: psql "$(grep DATABASE_URL /mnt/d/MIM/backend/.env | cut -d= -f2-)" -f insert_medieval_gold.sql

INSERT INTO holdings (user_id, metal_type, category, name, quantity, weight_grams, purity, purchase_price, purchase_date, graded, grade_cert, notes, is_listed, in_gallery, subcategory)
VALUES

(42, 'Gold', 'Coin', '1701 William III Full Gold Guinea', 1, 8.04, 0.9167, 3300.00, '2026-05-01',
false, NULL,
'An exceptional example in VF-XF grade (XF40 equivalent), traces of lustre between the legends. Second laureate bust right. Sceptre reverse. Only minted in the final year of William III''s reign before his death in March 1702 — a Pre-Act of Union coin struck when England and Scotland were still separate kingdoms. XRF tested for authenticity. Provenance: purchased from Kelvin B of Leeds, a specialist dealer connected to BNTA (British Numismatic Trade Association) members. Slightly underweight at 8.04g due to historical guinea revaluations in the early 18th century — standard for this type and does not impact auction or sale value. Spink Reference: S.3463.',
false, true, 'numismatic'),

(42, 'Gold', 'Coin', '1365 Charles V Franc a Pied', 1, 4.00, 0.999, 1000.00, '2026-05-01',
false, NULL,
'Gold ''Franc on foot'' — king shown standing in armour. One of the earliest French gold franc types, introduced by Charles V. Struck in exceptionally pure .999 fine gold. Full details throughout, unclipped flan. Contemporary mount present — the coin was worn as a pendant at some point in its long history, consistent with coins of this type. Comes with original purchase ticket dated September 1991 at GBP 150, providing genuine provenance. At 661 years old, this is the oldest coin in the collection. Spink Reference: Cf. C457. Diameter: ~30mm.',
false, true, 'numismatic'),

(42, 'Gold', 'Coin', '1507 Louis XII Gold Ecu with Porcupine', 1, 3.12, 0.963, 530.00, '2026-05-01',
false, NULL,
'Gold Ecu featuring the porcupine — the personal heraldic badge of Louis XII of France, making this a specific and distinctive collectible type. Only minted in 1507, making it a single-year issue. A chunk of the legend is missing from the edge (typical of heavily circulated hammered coinage), however the central design and details are excellent throughout. 519 years old. Grade: MDF — chunk of legends removed, excellent details otherwise.',
false, true, 'numismatic'),

(42, 'Gold', 'Coin', '1498 Louis XII Gold Ecu au Soleil', 1, 3.29, 0.963, 530.00, '2026-05-01',
false, NULL,
'Gold Ecu au Soleil of Louis XII of France. The Ecu au Soleil was a major French trade coin of the era, highly trusted across Europe for its consistent gold content. Weight of 3.29g is only 0.06g short of the standard — essentially full weight. Purity of .963 — higher than a modern 22-carat sovereign. Damaged edge consistent with age and circulation, however the central design retains lovely detail throughout. 527 years old. Grade: MDF — damaged edge, lovely details overall.',
false, true, 'numismatic'),

(42, 'Gold', 'Coin', '1422-1461 Charles VII Demi Ecu d''Or', 1, 1.32, 0.979, 350.00, '2026-05-01',
false, NULL,
'Gold half Ecu d''Or of Charles VII of France — the king whom Joan of Arc fought to have crowned at Reims in 1429. This coin was struck during the same reign, potentially during Joan of Arc''s own lifetime (she was executed in 1431). The flan is cracked, the coin has been clipped, and shows evidence of a former mount — all acknowledged and consistent with the grade and age. Between 565 and 604 years old. Grade: Cracked flan, clipped and ex-mount.',
false, true, 'numismatic'),

(42, 'Gold', 'Coin', '1519 Francis I Ecu d''Or au Soleil', 1, 2.92, 0.958, 450.00, '2026-05-01',
false, NULL,
'Gold Ecu d''Or au Soleil of Francis I of France. Struck in 1519 — an extraordinary year: Leonardo da Vinci died that year in the service of Francis I at Amboise. The Field of the Cloth of Gold meeting between Francis I and Henry VIII of England took place the following year, 1520. Weight 2.92g at .958 purity. Chewed edges consistent with hammered coinage of this period — the central design is intact. 506 years old. Grade: MDF — chewed edges, intact example.',
false, true, 'numismatic');
