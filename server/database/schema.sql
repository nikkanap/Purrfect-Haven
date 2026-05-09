-- purrfect haven database schema (v3 - final)
-- consolidated lahat ng patches sa isang file.
-- gamitin ito para sa fresh setup via `npm run migrate`.

CREATE DATABASE IF NOT EXISTS purrfect_haven;
USE purrfect_haven;

-- =====================================================
-- table: species
-- lookup table para sa pet types (Dog, Cat, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS Species (
  species_id   INT         NOT NULL AUTO_INCREMENT,
  species_name VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (species_id)
);

-- =====================================================
-- table: users
-- accounts.  is_admin: 0 = regular user, 1 = admin.
-- =====================================================
CREATE TABLE IF NOT EXISTS Users (
  user_id       INT          NOT NULL AUTO_INCREMENT,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  city          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  cell_num      VARCHAR(15)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_admin      TINYINT      NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);

-- =====================================================
-- table: pets
-- pwedeng auto-created kapag in-approve ng admin yung community post.
-- =====================================================
CREATE TABLE IF NOT EXISTS Pets (
  pet_id           INT          NOT NULL AUTO_INCREMENT,
  name             VARCHAR(100) NOT NULL,
  species_id       INT          NOT NULL,
  breed            VARCHAR(100),
  sex              VARCHAR(10)  NOT NULL,
  age              INT,
  color            VARCHAR(100),
  description      TEXT,
  location_rescued VARCHAR(255),
  date_rescued     DATETIME,
  location_held    VARCHAR(255) NOT NULL,
  date_posted      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_adopted       TINYINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (pet_id),
  FOREIGN KEY (species_id) REFERENCES Species(species_id)
);

-- =====================================================
-- table: pet_photos
-- multiple photos per pet
-- =====================================================
CREATE TABLE IF NOT EXISTS pet_photos (
  pet_pic_id INT          NOT NULL AUTO_INCREMENT,
  pet_id     INT          NOT NULL,
  file_path  VARCHAR(255) NOT NULL,
  PRIMARY KEY (pet_pic_id),
  FOREIGN KEY (pet_id) REFERENCES Pets(pet_id) ON DELETE CASCADE
);

-- =====================================================
-- table: adoptions
-- application form fields kasama na rin dito (kesa sa separate table)
-- para mas simple, walang masyadong join.
-- =====================================================
CREATE TABLE IF NOT EXISTS Adoptions (
  adoption_id    INT NOT NULL AUTO_INCREMENT,
  user_id        INT NOT NULL,  -- yung nag-apply
  pet_id         INT NOT NULL,

  -- status flow ng adoption (lahat ng phases):
  --   pending               → bagong submit, hindi pa na-review
  --   appointment_scheduled → may date na para makita yung pet (phase 0)
  --   under_review          → tapos na appointment, nag-de-decide pa admin
  --   approved              → in-approve ng admin (phase 3)
  --   rejected              → in-reject ng admin
  --   completed             → na-claim na, official adopted
  status ENUM(
    'pending',
    'appointment_scheduled',
    'under_review',
    'approved',
    'rejected',
    'completed'
  ) NOT NULL DEFAULT 'pending',

  -- application form fields (phase 1)
  applicant_address    VARCHAR(255) NOT NULL,
  is_first_pet         TINYINT      NOT NULL DEFAULT 0,
  has_experience       TINYINT      NOT NULL DEFAULT 0,  -- may experience sa pets?
  has_other_pets       TINYINT      NOT NULL DEFAULT 0,  -- may iba pang pets sa bahay?
  has_children         TINYINT      NOT NULL DEFAULT 0,  -- may bata sa bahay?
  financial_capability TEXT,
  motivation           TEXT,                              -- bakit gusto mag-adopt?
  owns_home            TINYINT      NOT NULL DEFAULT 0,

  -- phase 0: appointment para makita yung pet
  appointment_date DATETIME NULL,

  -- phase 3: decision details
  decision_note TEXT     NULL,  -- reason ng admin (approve o reject)
  date_decided  DATETIME NULL,

  -- timeline tracking
  date_applied   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_completed DATETIME NULL,  -- kapag na-claim na yung pet

  PRIMARY KEY (adoption_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (pet_id)  REFERENCES Pets(pet_id)
);

-- =====================================================
-- table: rescue_reports
-- =====================================================
CREATE TABLE IF NOT EXISTS Rescue_Reports (
  report_id     INT          NOT NULL AUTO_INCREMENT,
  user_id       INT          NOT NULL,
  location      VARCHAR(255) NOT NULL,
  description   TEXT         NOT NULL,
  status        ENUM('pending', 'in_progress', 'resolved', 'closed')
                NOT NULL DEFAULT 'pending',
  admin_note    TEXT         NULL,
  date_reported DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_resolved DATETIME     NULL,
  PRIMARY KEY (report_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- =====================================================
-- table: rescue_report_photos
-- =====================================================
CREATE TABLE IF NOT EXISTS rescue_report_photos (
  photo_id  INT          NOT NULL AUTO_INCREMENT,
  report_id INT          NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  PRIMARY KEY (photo_id),
  FOREIGN KEY (report_id) REFERENCES Rescue_Reports(report_id) ON DELETE CASCADE
);

-- =====================================================
-- table: community_posts
-- kapag in-approve ng admin, gagawa ng Pet record at ila-link via created_pet_id.
-- =====================================================
CREATE TABLE IF NOT EXISTS Community_Posts (
  post_id     INT NOT NULL AUTO_INCREMENT,
  user_id     INT NOT NULL,  -- yung nag-post

  -- details ng pet na ipa-post
  pet_name    VARCHAR(100) NOT NULL,
  species_id  INT          NOT NULL,
  breed       VARCHAR(100),
  sex         VARCHAR(10)  NOT NULL,
  age         INT,
  color       VARCHAR(100),
  personality TEXT, 
  organization VARCHAR(255),  
  health      TEXT,
  description TEXT,
  location    VARCHAR(255) NOT NULL,

  -- moderation by admin
  status         ENUM('pending', 'approved', 'rejected')
                 NOT NULL DEFAULT 'pending',
  admin_note     TEXT NULL,
  created_pet_id INT  NULL,  -- pag in-approve, ito yung Pet record na nagawa

  date_posted   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_reviewed DATETIME NULL,

  PRIMARY KEY (post_id),
  FOREIGN KEY (user_id)        REFERENCES Users(user_id),
  FOREIGN KEY (species_id)     REFERENCES Species(species_id),
  FOREIGN KEY (created_pet_id) REFERENCES Pets(pet_id) ON DELETE SET NULL
);

-- =====================================================
-- table: community_post_photos
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_photos (
  photo_id  INT          NOT NULL AUTO_INCREMENT,
  post_id   INT          NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  PRIMARY KEY (photo_id),
  FOREIGN KEY (post_id) REFERENCES Community_Posts(post_id) ON DELETE CASCADE
);

-- =====================================================
-- table: welfare_checks
-- phase 4a — admin requests, adopter responds.
--
-- status flow:
--   pending   → hiniling ng admin, hindi pa sumagot ang adopter
--   completed → sumagot na ang adopter
--
-- nullable ang condition_status at notes kasi pending pa.
-- =====================================================
CREATE TABLE IF NOT EXISTS Welfare_Checks (
  check_id         INT NOT NULL AUTO_INCREMENT,
  adoption_id      INT NOT NULL,
  admin_id         INT NOT NULL,  -- sinong admin nag-request
  status           ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  requested_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at     DATETIME NULL,

  -- ifi-fill kapag sumagot na ang adopter
  condition_status ENUM('excellent', 'good', 'concerning', 'critical') NULL,
  notes            TEXT NULL,

  PRIMARY KEY (check_id),
  FOREIGN KEY (adoption_id) REFERENCES Adoptions(adoption_id),
  FOREIGN KEY (admin_id)    REFERENCES Users(user_id)
);

-- =====================================================
-- table: welfare_check_photos
-- photos uploaded by adopter sa welfare check response
-- =====================================================
CREATE TABLE IF NOT EXISTS welfare_check_photos (
  photo_id  INT          NOT NULL AUTO_INCREMENT,
  check_id  INT          NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  PRIMARY KEY (photo_id),
  FOREIGN KEY (check_id) REFERENCES Welfare_Checks(check_id) ON DELETE CASCADE
);

-- =====================================================
-- table: post_adoption_updates
-- phase 4b — adoptive parent shares update tungkol sa pet (anytime).
-- =====================================================
CREATE TABLE IF NOT EXISTS Post_Adoption_Updates (
  update_id   INT      NOT NULL AUTO_INCREMENT,
  adoption_id INT      NOT NULL,
  update_text TEXT     NOT NULL,
  date_posted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (update_id),
  FOREIGN KEY (adoption_id) REFERENCES Adoptions(adoption_id) ON DELETE CASCADE
);

-- =====================================================
-- table: post_adoption_update_photos
-- =====================================================
CREATE TABLE IF NOT EXISTS post_adoption_update_photos (
  photo_id  INT          NOT NULL AUTO_INCREMENT,
  update_id INT          NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  PRIMARY KEY (photo_id),
  FOREIGN KEY (update_id) REFERENCES Post_Adoption_Updates(update_id) ON DELETE CASCADE
);

-- =====================================================
-- table: stories
-- featured stories — three flows:
--   1. admin requests adopter to write → adopter submits → admin reviews
--   2. adopter initiates own story → admin reviews
--   3. admin writes own story → auto-published
--
-- status flow:
--   pending   → admin requested, adopter hindi pa sumusulat
--   submitted → adopter wrote it, naghihintay ng review
--   published → in-publish ng admin (lalabas sa homepage)
--   rejected  → in-reject ng admin
--
-- nullable ang title at content kasi pending pa (admin-requested) wala pang laman.
-- =====================================================
CREATE TABLE IF NOT EXISTS Stories (
  story_id              INT NOT NULL AUTO_INCREMENT,
  user_id               INT NOT NULL,
  pet_id                INT NOT NULL,
  adoption_id           INT NULL,   -- optional link sa specific adoption record
  requested_by_admin_id INT NULL,   -- kung admin-initiated request, sino yung admin
  title                 VARCHAR(255) NULL,
  content               TEXT NULL,
  status                ENUM('pending', 'submitted', 'published', 'rejected')
                        NOT NULL DEFAULT 'submitted',
  admin_note            TEXT NULL,  -- note sa adopter pag rejected o accepted
  submitted_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at          DATETIME NULL,
  PRIMARY KEY (story_id),
  FOREIGN KEY (user_id)               REFERENCES Users(user_id),
  FOREIGN KEY (pet_id)                REFERENCES Pets(pet_id),
  FOREIGN KEY (adoption_id)           REFERENCES Adoptions(adoption_id) ON DELETE SET NULL,
  FOREIGN KEY (requested_by_admin_id) REFERENCES Users(user_id)
);

-- =====================================================
-- table: story_photos
-- =====================================================
CREATE TABLE IF NOT EXISTS story_photos (
  photo_id  INT          NOT NULL AUTO_INCREMENT,
  story_id  INT          NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  PRIMARY KEY (photo_id),
  FOREIGN KEY (story_id) REFERENCES Stories(story_id) ON DELETE CASCADE
);