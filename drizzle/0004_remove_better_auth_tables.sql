-- Better AuthからFirebase Authに移行したため、不要になったテーブルを削除
-- 認証情報（セッション、アカウント、トークンなど）はFirebase側で管理される

PRAGMA foreign_keys=OFF;

-- sessionsテーブルを削除（Firebase Authでセッション管理）
DROP TABLE IF EXISTS `sessions`;

-- accountsテーブルを削除（Firebase Authでアカウント管理）
DROP TABLE IF EXISTS `accounts`;

-- verificationsテーブルを削除（Firebase Authで認証管理）
DROP TABLE IF EXISTS `verifications`;

PRAGMA foreign_keys=ON;

