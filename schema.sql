-- Facultatif : les fonctions créent ces tables toutes seules au premier appel.
CREATE TABLE IF NOT EXISTS visitors (
  vid        TEXT PRIMARY KEY,
  first_seen BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  jid  TEXT   NOT NULL,
  type TEXT   NOT NULL,
  vid  TEXT   NOT NULL,
  ts   BIGINT NOT NULL,
  PRIMARY KEY (jid, type)   -- un évènement une seule fois par parcours
);
