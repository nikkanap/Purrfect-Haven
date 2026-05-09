-- =====================================================
-- Purrfect Haven — Comprehensive Demo Seed (CORRECTED v2)
-- =====================================================
-- IMPORTANT: Run on a FRESH database. To reset:
--   mysql -u root -p -e "DROP DATABASE purrfect_haven;"
--   cd server && npm run migrate && npm run seed
--
-- All test users have password: Demo1234
-- =====================================================

USE purrfect_haven;

-- -----------------------------------------------------
-- Species
-- -----------------------------------------------------
INSERT IGNORE INTO Species (species_id, species_name) VALUES
  (1, 'Dog'),
  (2, 'Cat'),
  (3, 'Rabbit'),
  (4, 'Bird'),
  (5, 'Guinea Pig');

-- -----------------------------------------------------
-- Users (password sa lahat: "Demo1234")
-- -----------------------------------------------------
INSERT IGNORE INTO Users (user_id, first_name, last_name, city, email, cell_num, password_hash, is_admin, created_at) VALUES
  (1, 'Eugene',  'Esguerra',  'Tacloban', 'euesguerra@up.edu.ph',     '09171791000', '$2b$10$hgDxXj9.DDIaEsWU9vrIU.EkSKwx/D8UdsGH38dAXwO42h4yfO4tC', 1, '2025-09-01 08:00:00'),
  (2, 'Maria',   'Santos',    'Palo',     'maria.santos@email.com',   '09171791001', '$2b$10$hgDxXj9.DDIaEsWU9vrIU.EkSKwx/D8UdsGH38dAXwO42h4yfO4tC', 0, '2025-09-15 10:00:00'),
  (3, 'Juan',    'Dela Cruz', 'Tanauan',  'juan.delacruz@email.com',  '09171791002', '$2b$10$hgDxXj9.DDIaEsWU9vrIU.EkSKwx/D8UdsGH38dAXwO42h4yfO4tC', 0, '2025-09-20 14:00:00'),
  (4, 'Ana',     'Reyes',     'Tacloban', 'ana.reyes@email.com',      '09171791003', '$2b$10$hgDxXj9.DDIaEsWU9vrIU.EkSKwx/D8UdsGH38dAXwO42h4yfO4tC', 0, '2025-08-10 09:00:00'),
  (5, 'Carlos',  'Mendoza',   'Tacloban', 'carlos.mendoza@email.com', '09171791004', '$2b$10$hgDxXj9.DDIaEsWU9vrIU.EkSKwx/D8UdsGH38dAXwO42h4yfO4tC', 0, '2026-05-01 11:00:00'),
  (6, 'Liza',    'Garcia',    'Palo',     'liza.garcia@email.com',    '09171791005', '$2b$10$hgDxXj9.DDIaEsWU9vrIU.EkSKwx/D8UdsGH38dAXwO42h4yfO4tC', 0, '2025-10-05 13:00:00'),
  (7, 'Isho',    'Mayo',      'Tanauan',  'isho.mayo@email.com',      '09171791006', '$2b$10$hgDxXj9.DDIaEsWU9vrIU.EkSKwx/D8UdsGH38dAXwO42h4yfO4tC', 0, '2026-04-20 16:00:00');

-- -----------------------------------------------------
-- Pets
-- -----------------------------------------------------
INSERT IGNORE INTO Pets (pet_id, name, species_id, breed, sex, age, color, description, location_rescued, date_rescued, location_held, date_posted, is_adopted) VALUES
  (1, 'Chico',      1, 'Aspin',            'Male',   2,    'Brown and white', 'Chico was found wandering near a wet market. Now healthy, vaccinated, and very friendly.', 'Tacloban Public Market', '2025-10-15 09:00:00', 'Purrfect Haven Shelter', '2025-10-20 10:00:00', 0),
  (2, 'Koko',       2, 'Puspin',           'Male',   NULL, 'Gray and white',  'Koko was found as a stray kitten. Estimated 1 year old. Playful and energetic.',           'Palo, Leyte',            '2025-11-10 16:00:00', 'Purrfect Haven Shelter', '2025-11-12 10:00:00', 0),
  (3, 'Pancho',     4, 'Lovebird',         'Male',   1,    'Peach-faced',     'Pancho is a sociable lovebird looking for a quiet home with attentive caretakers.',         'Anibong, Tacloban',      '2025-12-01 10:00:00', 'Purrfect Haven Shelter', '2025-12-03 09:00:00', 0),
  (4, 'Cottonball', 3, 'Philippine White', 'Female', 2,    'White',           'Cottonball was abandoned near a school. Gentle and ideal for families with children.',     'Candahug, Palo',         '2025-10-01 08:30:00', 'Purrfect Haven Shelter', '2025-10-05 09:00:00', 0),
  (5, 'Tigre',      2, 'Puspin',           'Male',   3,    'Tabby',           'Tigre is a confident cat who gets along with other pets. Loves window perches.',           'Real Street, Tacloban',  '2025-11-22 12:00:00', 'Purrfect Haven Shelter', '2025-11-25 10:00:00', 0),
  (6,  'Whiskers',  2, 'Puspin', 'Female', 2,    'Black and white',  'Whiskers is shy at first but very affectionate once she trusts you.',                'Marasbaras, Tacloban', '2026-03-15 09:00:00', 'Purrfect Haven Shelter', '2026-03-18 10:00:00', 0),
  (7,  'Browny',    1, 'Aspin',  'Male',   3,    'Light brown',      'Browny is gentle, well-trained, and great with children.',                           'Sagkahan, Tacloban',   '2026-02-10 11:00:00', 'Purrfect Haven Shelter', '2026-02-15 09:00:00', 0),
  (8,  'Tofu',      2, 'Puspin', 'Female', 1,    'Cream',            'Tofu is a sweet, quiet cat who loves naps in sunny spots.',                          'San Jose, Tacloban',   '2026-01-20 14:00:00', 'Purrfect Haven Shelter', '2026-01-22 10:00:00', 0),
  (9,  'Pochi',     1, 'Aspin',  'Male',   2,    'Black with white', 'Pochi is energetic, loves long walks, and would do well in an active household.',    'Abucay, Tacloban',     '2025-12-05 10:00:00', 'Purrfect Haven Shelter', '2025-12-10 09:00:00', 0),
  (10, 'Mingming',  2, 'Puspin', 'Female', 4,    'Gray',             'Mingming is mature and prefers a calm home. She is not great with young children.',  'Ormoc City',           '2025-11-15 08:00:00', 'Purrfect Haven Shelter', '2025-11-20 10:00:00', 0),
  (11, 'Mochi',     2, 'Puspin', 'Female', 3, 'Orange tabby', 'Mochi was surrendered by her previous owner. Calm, litter-trained, and loves to be held.',     'Ormoc City',           '2025-09-18 11:00:00', 'Purrfect Haven Shelter', '2025-09-22 08:00:00', 1),
  (12, 'Bantay',    1, 'Aspin',  'Male',   4, 'Golden brown', 'Bantay was rescued from an abusive household. Now recovering well and responding to training.', 'Abucay, Tacloban',     '2025-08-22 13:00:00', 'Purrfect Haven Shelter', '2025-09-01 09:00:00', 1),
  (13, 'Nala',      2, 'Puspin', 'Female', 2, 'Calico',       'Nala was found pregnant and gave birth at the shelter. Her kittens have been rehomed.',         'Downtown Tacloban',    '2025-07-14 10:00:00', 'Purrfect Haven Shelter', '2025-08-01 09:00:00', 1),
  (14, 'Toby',      1, 'Aspin',  'Male',   5, 'Brown',        'Toby was an old shelter resident who finally found his forever home.',                           'Tanauan, Leyte',       '2025-06-01 09:00:00', 'Purrfect Haven Shelter', '2025-06-15 09:00:00', 1);

-- -----------------------------------------------------
-- Pet Photos (placeholder paths — onError fallback handles missing files)
-- -----------------------------------------------------
INSERT IGNORE INTO pet_photos (pet_pic_id, pet_id, file_path) VALUES
  (1,  1,  'uploads/pets/chico-1.jpg'),
  (2,  1,  'uploads/pets/chico-2.jpg'),
  (3,  2,  'uploads/pets/koko-1.jpg'),
  (4,  3,  'uploads/pets/pancho-1.jpg'),
  (5,  4,  'uploads/pets/cottonball-1.jpg'),
  (6,  4,  'uploads/pets/cottonball-2.jpg'),
  (7,  5,  'uploads/pets/tigre-1.jpg'),
  (8,  6,  'uploads/pets/whiskers-1.jpg'),
  (9,  7,  'uploads/pets/browny-1.jpg'),
  (10, 8,  'uploads/pets/tofu-1.jpg'),
  (11, 9,  'uploads/pets/pochi-1.jpg'),
  (12, 10, 'uploads/pets/mingming-1.jpg'),
  (13, 11, 'uploads/pets/mochi-1.jpg'),
  (14, 11, 'uploads/pets/mochi-2.jpg'),
  (15, 12, 'uploads/pets/bantay-1.jpg'),
  (16, 13, 'uploads/pets/nala-1.jpg'),
  (17, 14, 'uploads/pets/toby-1.jpg');

-- -----------------------------------------------------
-- Adoptions — sakop ang lahat ng 6 statuses
-- -----------------------------------------------------
INSERT IGNORE INTO Adoptions (
  adoption_id, user_id, pet_id, status,
  applicant_address, is_first_pet, has_experience, has_other_pets, has_children, owns_home,
  financial_capability, motivation,
  appointment_date, decision_note, date_decided,
  date_applied, date_completed
) VALUES
  -- (1) PENDING
  (1, 5, 6, 'pending',
   'Brgy. Sagkahan, Tacloban City', 1, 0, 0, 0, 1,
   'Stable monthly income, can comfortably afford pet supplies and vet care.',
   'I have always wanted a cat as a companion. Whiskers seems gentle and would fit my quiet apartment.',
   NULL, NULL, NULL,
   '2026-05-05 10:00:00', NULL),

  -- (2) APPOINTMENT_SCHEDULED
  (2, 7, 7, 'appointment_scheduled',
   'Brgy. San Roque, Tanauan, Leyte', 0, 1, 1, 1, 1,
   'Both my partner and I work. Combined income covers food, vet, and emergency care.',
   'We have been looking for a calm dog who is good with our kids. Browny seems perfect.',
   '2026-05-12 15:00:00', NULL, NULL,
   '2026-04-25 14:30:00', NULL),

  -- (3) UNDER_REVIEW
  (3, 2, 8, 'under_review',
   'Brgy. Candahug, Palo, Leyte', 0, 1, 0, 0, 1,
   'Steady income from work-from-home job. Have a separate budget for pets.',
   'I lost my previous cat last year and feel ready to welcome a new one. Tofu reminds me of her.',
   '2026-04-30 10:00:00', NULL, NULL,
   '2026-04-15 09:00:00', NULL),

  -- (4) APPROVED
  (4, 6, 9, 'approved',
   'Brgy. Anibong, Palo, Leyte', 0, 1, 0, 1, 1,
   'Two-income household. Already budgeting for pet food and yearly checkups.',
   'My family has been looking for an active dog to join our morning runs. Pochi fits the bill.',
   '2026-04-18 14:00:00',
   'Welcome to the family! Please coordinate with the shelter for pickup.',
   '2026-04-19 10:00:00',
   '2026-04-01 11:00:00', NULL),

  -- (5) REJECTED
  (5, 6, 10, 'rejected',
   'Brgy. Anibong, Palo, Leyte', 0, 1, 0, 1, 1,
   'Two-income household.',
   'I thought Mingming would be a nice second pet for our home.',
   NULL,
   'Mingming is not suitable for households with young children. We have approved your other application for Pochi instead.',
   '2026-03-12 14:00:00',
   '2026-03-10 09:00:00', NULL),

  -- (6) COMPLETED — Ana / Mochi
  (6, 4, 11, 'completed',
   'Brgy. Marasbaras, Tacloban City', 0, 1, 0, 0, 1,
   'Stable government job. Long-term pet owner.',
   'I have always loved cats. Mochi is a sweet senior who deserves a loving home.',
   '2025-10-15 14:00:00',
   'Approved! Thank you for choosing Mochi.',
   '2025-10-15 15:30:00',
   '2025-10-01 09:00:00', '2025-10-20 10:00:00'),

  -- (7) COMPLETED — Juan / Bantay
  (7, 3, 12, 'completed',
   'Brgy. Pago, Tanauan, Leyte', 0, 1, 0, 1, 1,
   'Family income covers pet care comfortably. Own a fenced yard.',
   'Bantay needs a patient owner. We have experience with rescued dogs and a calm household.',
   '2025-09-20 15:00:00',
   'Bantay deserves a great home. Welcome to the Dela Cruz family.',
   '2025-09-20 16:30:00',
   '2025-09-05 10:00:00', '2025-09-25 11:00:00'),

  -- (8) COMPLETED — Maria / Nala
  (8, 2, 13, 'completed',
   'Brgy. Candahug, Palo, Leyte', 0, 1, 0, 0, 1,
   'Steady work-from-home income. Have raised cats since childhood.',
   'I lost my last cat to old age. Nala has the same calm energy I love.',
   '2025-08-25 13:00:00',
   'Approved.',
   '2025-08-25 14:00:00',
   '2025-08-10 09:00:00', '2025-08-30 12:00:00'),

  -- (9) COMPLETED — Maria / Toby (older adoption)
  (9, 2, 14, 'completed',
   'Brgy. Candahug, Palo, Leyte', 0, 1, 1, 0, 1,
   'Adding a second pet — already accounted for in monthly budget.',
   'Toby and Nala can be companions. Senior dogs deserve quiet retirement homes.',
   '2025-07-15 13:00:00',
   'Approved. Toby will be glad to have a sibling.',
   '2025-07-15 14:00:00',
   '2025-07-01 09:00:00', '2025-07-20 11:00:00');

-- -----------------------------------------------------
-- Welfare Checks
-- -----------------------------------------------------
INSERT IGNORE INTO Welfare_Checks (check_id, adoption_id, admin_id, status, requested_at, responded_at, condition_status, notes) VALUES
  (1, 6, 1, 'pending',   '2026-04-20 10:00:00', NULL,                  NULL,        NULL),
  (2, 7, 1, 'completed', '2026-02-15 10:00:00', '2026-02-18 14:30:00', 'excellent', 'Bantay is thriving! He has gained healthy weight and his coat looks much better. He plays daily with the kids and loves our morning walks. Vet checkup last month was all clean.'),
  (3, 8, 1, 'completed', '2026-01-10 11:00:00', '2026-01-13 09:00:00', 'good',      'Nala has settled in beautifully. She is more confident now and has claimed her favorite spot by the window. Eating well and active.');

-- -----------------------------------------------------
-- Welfare Check Photos
-- -----------------------------------------------------
INSERT IGNORE INTO welfare_check_photos (check_id, file_path) VALUES
  (2, 'uploads/welfare-checks/bantay-welfare-1.jpg'),
  (2, 'uploads/welfare-checks/bantay-welfare-2.jpg'),
  (3, 'uploads/welfare-checks/nala-welfare-1.jpg');

-- -----------------------------------------------------
-- Post-Adoption Updates
-- -----------------------------------------------------
INSERT IGNORE INTO Post_Adoption_Updates (adoption_id, update_text, date_posted) VALUES
  (7, 'First month with Bantay! He is adjusting really well. Sleeps through the night already and follows the kids around the yard. Such a gentle giant.', '2025-10-25 18:00:00'),
  (7, 'Took Bantay to the vet for his checkup — fully vaccinated, healthy weight, and the vet says his recovery from past trauma is going great. So proud of this boy.', '2025-12-10 11:00:00'),
  (6, 'Mochi has officially claimed the entire couch. She loves greeting me at the door every morning. Best decision we ever made.', '2025-11-15 19:00:00'),
  (8, 'Nala caught her first lizard today (and was very proud). She is also best friends with Toby — they nap together now.', '2025-12-20 16:00:00');

-- -----------------------------------------------------
-- Stories — kompleto na ang columns (no was_requested, may user_id at pet_id)
-- -----------------------------------------------------
INSERT IGNORE INTO Stories (
  story_id, user_id, pet_id, adoption_id, requested_by_admin_id,
  title, content, status, admin_note, submitted_at, published_at
) VALUES
  -- (1) PENDING — admin requested Maria, Nala
  (1, 2, 13, 8, 1,
   NULL, NULL, 'pending', NULL,
   '2026-04-25 10:00:00', NULL),

  -- (2) SUBMITTED — Ana wrote, admin reviewing
  (2, 4, 11, 6, NULL,
   'How Mochi Found Her Forever Home',
   'When I first saw Mochi at the shelter, she was curled up alone in the corner of her enclosure. The staff said she had been surrendered by an elderly owner who could no longer care for her, and she had been at the shelter for over a month. I knelt down and she slowly walked over, headbutted my hand, and started purring like she had known me forever.\n\nThe first week at home was an adjustment for both of us. I had lost my previous cat the year before, and welcoming a new one felt heavy. But Mochi has this quiet way of being present — she would sit beside me while I worked, follow me from room to room, and make these soft little chirping sounds whenever she wanted attention.\n\nIt has been six months now. She has claimed every soft surface in my apartment, learned to wake me up at exactly 6 AM for breakfast, and become the most loving companion I could have asked for. Adopting Mochi did not just give her a home — it gave me one too.',
   'submitted', NULL,
   '2026-04-28 20:30:00', NULL),

  -- (3) PUBLISHED — Juan, Bantay (live sa homepage)
  (3, 3, 12, 7, NULL,
   'Bantay: From Rescued to Beloved',
   'When we first met Bantay, he flinched at every loud noise and cowered when we reached for him. The shelter told us he had been rescued from an abusive household — the kind of past that breaks your heart to even imagine. But there was something in his eyes that day that told us he was ready to trust again, if we were patient enough to earn it.\n\nThe first month was slow. He would not come into the living room, would not eat unless we left the room, and slept in the corner of the kitchen. We let him take his time. We sat on the floor and read books out loud just so he could hear our voices and learn we were not threats.\n\nThen one morning, he padded into the bedroom on his own and put his head on the bed. That was the moment we knew. Six months later, Bantay sleeps on the foot of our bed, plays with our kids in the yard, and waits by the door every evening for me to come home from work. He still flinches sometimes, but he trusts us now. He chose us, and we are so grateful he did.',
   'published', NULL,
   '2026-03-01 19:00:00', '2026-03-05 10:00:00'),

  -- (4) REJECTED — Maria, Toby
  (4, 2, 14, 9, NULL,
   'Toby the Senior',
   'Toby is old.',
   'rejected',
   'Thank you for sharing! The story feels a bit too brief for our featured section — could you expand on Toby''s personality, your journey together, and what made him special? We would love to publish a fuller version.',
   '2025-11-01 14:00:00', NULL);

-- -----------------------------------------------------
-- Story Photos
-- -----------------------------------------------------
INSERT IGNORE INTO story_photos (story_id, file_path) VALUES
  (2, 'uploads/stories/mochi-story-1.jpg'),
  (2, 'uploads/stories/mochi-story-2.jpg'),
  (3, 'uploads/stories/bantay-story-1.jpg'),
  (3, 'uploads/stories/bantay-story-2.jpg'),
  (3, 'uploads/stories/bantay-story-3.jpg');

-- -----------------------------------------------------
-- Rescue Reports
-- -----------------------------------------------------
INSERT IGNORE INTO Rescue_Reports (report_id, user_id, location, description, status, date_reported, date_resolved, admin_note) VALUES
  (1, 3,
   'Real Street, Tacloban City',
   '**Full Name:** Juan Dela Cruz\n**Contact:** 09171791002\n**Animal Type:** Dog\n**Estimated Number:** 1\n**Date Spotted:** 2026-05-06\n**Time Spotted:** 17:30\n**Condition & Description:** A medium-sized brown dog with a noticeable limp on its hind leg. Appears underfed and is hiding under a parked car. Friendly when approached but visibly scared.',
   'pending',
   '2026-05-06 18:00:00', NULL, NULL),

  (2, 6,
   'Anibong, Tacloban City',
   '**Full Name:** Liza Garcia\n**Contact:** 09171791005\n**Animal Type:** Cat\n**Estimated Number:** 2\n**Date Spotted:** 2026-05-04\n**Time Spotted:** 09:00\n**Condition & Description:** Two kittens (around 2 months old) found in a cardboard box near a closed sari-sari store. One has eye discharge. Both are very thin.',
   'in_progress',
   '2026-05-04 10:00:00', NULL, 'Rescue team dispatched. Will update upon arrival.'),

  (3, 4,
   'Sagkahan, Tacloban City',
   '**Full Name:** Ana Reyes\n**Contact:** 09171791003\n**Animal Type:** Dog\n**Estimated Number:** 1\n**Date Spotted:** 2026-04-15\n**Time Spotted:** 14:00\n**Condition & Description:** A black puppy stuck in a drainage canal, unable to climb out. Whimpering but visibly conscious.',
   'resolved',
   '2026-04-15 14:30:00', '2026-04-15 17:00:00', 'Puppy successfully rescued and brought to the shelter. Healthy after vet check. Available for adoption next month.'),

  (4, 5,
   'Marasbaras, Tacloban City',
   '**Full Name:** Carlos Mendoza\n**Contact:** 09171791004\n**Animal Type:** Cat\n**Estimated Number:** 1\n**Date Spotted:** 2026-04-20\n**Time Spotted:** 11:00\n**Condition & Description:** A cat appearing to be injured under a bench at the public park.',
   'closed',
   '2026-04-20 11:30:00', '2026-04-20 16:00:00', 'Upon arrival, the cat was found to belong to a nearby resident and was simply resting. No rescue needed. Thank you for the report.');

-- -----------------------------------------------------
-- Rescue Report Photos
-- -----------------------------------------------------
INSERT IGNORE INTO rescue_report_photos (report_id, file_path) VALUES
  (1, 'uploads/rescue-reports/report-1-photo-1.jpg'),
  (2, 'uploads/rescue-reports/report-2-photo-1.jpg'),
  (2, 'uploads/rescue-reports/report-2-photo-2.jpg'),
  (3, 'uploads/rescue-reports/report-3-photo-1.jpg');

-- -----------------------------------------------------
-- Community Posts — kompleto na ang lahat ng required fields
-- -----------------------------------------------------
INSERT IGNORE INTO Community_Posts (
  post_id, user_id, pet_name, species_id, breed, sex, age, color,
  personality, organization, health, description, location,
  status, admin_note, created_pet_id, date_posted, date_reviewed
) VALUES
  -- (1) PENDING
  (1, 2, 'Tabby Junior', 2, 'Puspin', 'Female', 1, 'Gray tabby',
   'Playful and very affectionate, loves cuddles after meals.',
   NULL,
   'Vaccinated, dewormed, and litter-trained.',
   'Found her abandoned near our home. She has bonded well with my older cat but my landlord only allows one pet per unit. Looking for a loving home.',
   'Brgy. Candahug, Palo, Leyte',
   'pending', NULL, NULL,
   '2026-05-02 14:00:00', NULL),

  -- (2) APPROVED
  (2, 3, 'Bowser', 1, 'Aspin mix', 'Male', 3, 'Black and brown',
   'Friendly with kids and other dogs. Energetic but well-behaved indoors.',
   NULL,
   'Fully vaccinated, neutered.',
   'Found Bowser as a stray and have cared for him for two years. We are relocating abroad and cannot bring him with us. He deserves a loving family.',
   'Brgy. Pago, Tanauan, Leyte',
   'approved',
   'Approved and listed in the gallery. Thank you for helping rehome.',
   NULL,
   '2026-04-10 09:00:00', '2026-04-12 11:00:00'),

  -- (3) REJECTED
  (3, 7, 'Unknown', 2, NULL, 'Female', NULL, NULL,
   NULL, NULL, NULL,
   'Need to rehome a cat.',
   'Tanauan, Leyte',
   'rejected',
   'Please resubmit with clearer photos and complete pet history (vaccination, age, personality, etc.).',
   NULL,
   '2026-04-22 10:00:00', '2026-04-23 09:00:00');

-- -----------------------------------------------------
-- Community Post Photos
-- -----------------------------------------------------
INSERT IGNORE INTO community_post_photos (post_id, file_path) VALUES
  (1, 'uploads/community-posts/tabby-junior-1.jpg'),
  (1, 'uploads/community-posts/tabby-junior-2.jpg'),
  (2, 'uploads/community-posts/bowser-1.jpg');

-- =====================================================
-- DONE
-- Login (lahat ay password "Demo1234"):
--   Admin   : euesguerra@up.edu.ph
--   Adopter : maria.santos@email.com    (multi-pet, may pending story request)
--   Adopter : juan.delacruz@email.com   (published story sa homepage)
--   Adopter : ana.reyes@email.com       (submitted story, pending welfare check)
--   Adopter : carlos.mendoza@email.com  (pending application)
--   Adopter : liza.garcia@email.com     (1 approved + 1 rejected)
--   Adopter : isho.mayo@email.com       (appointment scheduled)
-- =====================================================