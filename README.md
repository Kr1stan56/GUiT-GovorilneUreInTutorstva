markdown
# 📚 TutorHub – Sistem za govorilne ure in tutorstvo

Celovita spletna aplikacija za organizacijo govorilnih ur, iskanje tutorjev in upravljanje terminov.

---

## 🚀 Tehnologije

- **Backend:** ASP.NET Core 8, Entity Framework Core, PostgreSQL (zunanji gostitelj)
- **Frontend:** React 19, Material UI (MUI), Vite
- **Baza podatkov:** PostgreSQL (že pripravljena in povezana – **brez potrebe po lokalni namestitvi**)

---

## ✅ Predpogoji

Pred zagonom morate imeti nameščeno:

- [.NET SDK 8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) (`dotnet --version`)
- [Node.js](https://nodejs.org/) (v18 ali novejši) (`node --version`)

**Baza podatkov je že samodejno povezana na zunanjem gostitelju (Neon.tech). Ni vam treba nameščati PostgreSQL, ustvarjati baz ali izvajati migracij – vse je že pripravljeno.**

---

## ⚙️ Zagon aplikacije

### 1. Backend (ASP.NET Core)

Odprite terminal v mapi `TutoringSystem.Server` in zaženite:

```bash
dotnet restore
dotnet run
Strežnik se zažene na: http://localhost:5236

🔗 Povezava do baze je že vnaprej konfigurirana v appsettings.json (zunanji gostitelj). Zato vam ni treba ničesar spreminjati.

2. Frontend (React)
Odprite nov terminal v mapi tutoringsystem.client:

bash
npm install
npm run dev
Aplikacija bo na voljo na: http://localhost:5173

🧑‍💻 Uporaba
Študent: ogled govorilnih ur, prijava / preklic, iskanje in sortiranje, pregled tutorjev.

Profesor / Tutor: dodajanje, urejanje in brisanje lastnih ur, pregled prijav, upravljanje predmetov (tutor).

Administrator: popoln nadzor nad uporabniki (spreminjanje vlog, brisanje), pregled vseh govorilnih ur, impersonacija.

🔐 Testni uporabniki (mock način)
Če želite preizkusiti aplikacijo brez vpliva na bazo, se prijavite kot admin (npr. admin@test.com / password123) in v Debug panelu (ikona hrošča levo na sredini) vklopite "Uporabi Mock podatke". Nato uporabite gumb "Mock prijava" za hitro preklapljanje med vlogami.

🐛 Možne težave
Težava	Rešitev
Backend se ne zažene (dotnet run ne deluje)	Preverite, da imate nameščen .NET 8 SDK.
Frontend se ne poveže z backendom	Preverite, da backend teče na http://localhost:5236. Če je port zaseden, ga spremenite v launchSettings.json in Program.cs.
CORS napaka v brskalniku	Preverite, da backend v Program.cs vsebuje builder.Services.AddCors(...) z dovoljenim izvorom http://localhost:5173.
📁 Struktura projekta
text
TutorHub/
├── TutoringSystem.Server/          # Backend (ASP.NET Core)
│   ├── Controllers/                # API endpointi
│   ├── Data/                       # DbContext
│   ├── Models/                     # Entitete
│   └── appsettings.json            # Povezava do baze (že nastavljena)
└── tutoringsystem.client/          # Frontend (React + Vite)
    ├── src/
    │   ├── api.js                  # Klici na backend
    │   ├── App.jsx                 # Glavna komponenta
    │   └── main.jsx
    └── package.json
📝 Opomba o bazi
Baza podatkov je že vnaprej pripravljena na zunanjem gostitelju (Neon.tech) in je samodejno povezana z aplikacijo. Ob zagonu backenda se aplikacija takoj poveže z obstoječo bazo – ni vam treba nameščati PostgreSQL, ustvarjati tabel ali izvajati migracij. Vse tabele (Uporabniki, govorilne_ure, predmeti …) in osnovni podatki (role, predmeti) so že prisotni.

🤝 Nadaljnji razvoj (predlogi)
Ocenjevanje tutorjev (zvezdice in komentarji)

E‑poštna obvestila o prijavah in preklicih

Koledarski pogled (tedenski / mesečni)

Ponavljajoče se govorilne ure

Temni način (dark mode)

Uživajte v uporabi TutorHub-a! 🎓