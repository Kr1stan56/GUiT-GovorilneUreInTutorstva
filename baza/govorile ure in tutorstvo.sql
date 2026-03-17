CREATE TABLE "Uporabniki"(
  id serial NOT NULL,
  ime character varying NOT NULL,
  priimek character varying NOT NULL,
  email character varying NOT NULL,
  geslo_hash character varying NOT NULL,
  rola_id integer NOT NULL,
  CONSTRAINT "Uporabniki_pkey" PRIMARY KEY(id)
);


CREATE TABLE "role"(
  id serial NOT NULL,
  naziv integer NOT NULL,
  opis text NOT NULL,
  CONSTRAINT role_pkey PRIMARY KEY(id)
);


CREATE TABLE predmeti(
  id serial NOT NULL,
  naziv character varying NOT NULL,
  opis text,
  CONSTRAINT predmeti_pkey PRIMARY KEY(id)
);


CREATE TABLE tutor_predmeti(
  id serial NOT NULL,
  predmet_id integer NOT NULL,
  "Uporabniki_id" integer NOT NULL,
  CONSTRAINT tutor_predmeti_pkey PRIMARY KEY(id)
);


CREATE TABLE govorilne_ure(
  id serial NOT NULL,
  zacetek timestamp NOT NULL,
  konec timestamp,
  učilnica integer NOT NULL,
  "Uporabnik_id" integer NOT NULL,
  predmet_id integer,
  CONSTRAINT govorilne_ure_pkey PRIMARY KEY(id)
);


CREATE TABLE rezervacije_govorilne(
  id serial NOT NULL,
  status integer NOT NULL,
  "Uporabnik_id" integer NOT NULL,
  govorilna_ura_id integer NOT NULL,
  CONSTRAINT rezervacije_govorilne_pkey PRIMARY KEY(id)
);


ALTER TABLE "Uporabniki"
  ADD CONSTRAINT "Uporabniki_rola_id_fkey"
    FOREIGN KEY (rola_id) REFERENCES "role" (id)
;


ALTER TABLE tutor_predmeti
  ADD CONSTRAINT tutor_predmeti_predmet_id_fkey
    FOREIGN KEY (predmet_id) REFERENCES predmeti (id)
;


ALTER TABLE govorilne_ure
  ADD CONSTRAINT "govorilne_ure_Uporabnik_id_fkey"
    FOREIGN KEY ("Uporabnik_id") REFERENCES "Uporabniki" (id)
;


ALTER TABLE govorilne_ure
  ADD CONSTRAINT govorilne_ure_predmet_id_fkey
    FOREIGN KEY (predmet_id) REFERENCES predmeti (id)
;


ALTER TABLE rezervacije_govorilne
  ADD CONSTRAINT "rezervacije_govorilne_Uporabnik_id_fkey"
    FOREIGN KEY ("Uporabnik_id") REFERENCES "Uporabniki" (id)
;


ALTER TABLE rezervacije_govorilne
  ADD CONSTRAINT rezervacije_govorilne_govorilna_ura_id_fkey
    FOREIGN KEY (govorilna_ura_id) REFERENCES govorilne_ure (id)
;


ALTER TABLE tutor_predmeti
  ADD CONSTRAINT "tutor_predmeti_Uporabniki_id_fkey"
    FOREIGN KEY ("Uporabniki_id") REFERENCES "Uporabniki" (id)
;

