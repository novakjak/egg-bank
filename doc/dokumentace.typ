#set page(
  paper: "a4",
  numbering: "1",
)
#set document(
  title: "Egg Bank",
  author: "Jakub Novák",
)
#show title: set text(size: 24pt)
#show title: set align(center)
#show image: set align(center) 

#title()
#image("SPSE-Jecna_Logo.png")
#align(center)[
#context document.author.join()

C4c

#link("mailto:novak17@spsejecna.cz")

#datetime.today().display()
]

#pagebreak()

= Specifikace požadavků

Egg Bank bude webová aplikace pro správu bankovního systému. Program bude umožňovat vytvoření uživatelských profilů,
ke kterým bude možno otevřít účty. Jednotlivé účty budou držet nějaký obnos měny (v tomto případě vajec) a bude možno
mezi jednotlivými účty měny přeposílat.

= Popis architektury

Systém se skládá z tří hlavních komponent. První dvě jsou součástí webového serveru a to frontend a backend.
Frontend bude ta část aplikace, se kterou budou pracovat uživatelé. Backend následně zpracovává požadavky
vyvolané frontendem a následně zaznamenává výsledky. Poslední z částí je databáze, do které budou zachyceny ony
výsledky práce backendu.

= Popis běhu aplikace

== Registrace uživatele
#image("Registrace-activity-diagram.png", height: 45%)

== Přihlášní uživatele
#image("Login-activity-diagram.png", height: 45%)

== Otevření účtu
#image("Otevreni-uctu-activity-diagram.png", height: 45%)

= Konfigurace, instalace a spuštění

Dokumentaci pro konfiguraci, instalaci a spuštění naleznete v souboru _README.md_ v kořenovém adresáři projektu.

= Použitá práce třetích stran

Aplikace závisí na těchto knihovnách, programech a technologiích:

- React - #link("https://react.dev/")
- React Router - #link("https://https://reactrouter.com/")
- Heroicons - #link("https://heroicons.com/")
- Tailwindcss - #link("https://tailwindcss.com/")
- Vite - #link("https://vite.dev/")
- Typescript - #link("https://www.typescriptlang.org/")
- Node.js - #link("https://nodejs.org/en")
- Microsoft SQL Server - #link("https://www.microsoft.com/en-us/sql-server/sql-server-downloads")

= Licence

Všechen kód je pod licencí MIT. Plné znění tohoto dokumentu najdete v souboru _LICENSE_.

