/* Novosti — hrvatski.
 * Prijevod ./en.js, koji je izvornik. Prevedeni su samo unosi unutar
 * tromjesečnog okna koje stranica prikazuje; stariji ostaju u engleskom
 * izvorniku, kamo se i upisuju. Unos koji nedostaje sam se vraća na engleski.
 */

export default {
    title: "Novosti",

    intro: `Što je u posljednja tri mjeseca dodano u Slovenski genetski atlas, najnovije prvo. Navedene
        su samo nove mogućnosti i promjene u radu atlasa; ispravci i redovita osvježavanja podataka nisu.
        Sve starije nalazi se u <a href="https://github.com/rodoslovje/genetic-atlas/commits/main"
        target="_blank" rel="noopener noreferrer">povijesti projekta na GitHubu</a>.`,

    entries: [
        {
            date: "2026-09-16",
            items: [
                {
                    title: "Blokovno stablo, drugi način čitanja linije",
                    text: `Oba prikaza linija sada imaju kartice <em>Stablo</em> i <em>Blokovno
                        stablo</em>. Blokovno stablo stavlja vrijeme na okomitu os: svaka je grana nacrtana
                        preko razdoblja u kojem je postojala kao jedna jedina linija, zajedno sa starošću
                        svojeg zajedničkog pretka i 68-postotnim rasponom te procjene, svojim ekvivalentnim
                        SNP-ovima i svakim članom projekta kao karticom pod granom do koje je testiran.
                        Klikom na blok pratite tu liniju u dubinu, a rezultat izvozite u SVG kao i svaki
                        drugi prikaz.`,
                },
                {
                    title: "Upute za korištenje i ove novosti",
                    text: `Traka na dnu atlasa sada vodi do <a href="/guide/">uputa za korištenje</a>,
                        koje redom opisuju svaki prikaz i svaku mogućnost, i do ovih novosti. Oboje se
                        otvara u vlastitoj kartici, na jeziku na kojem čitate atlas, a datumi inačice i
                        podataka preselili su se u istu traku.`,
                },
            ],
        },
        {
            date: "2026-08-28",
            items: [
                {
                    title: "Francuski",
                    text: `Atlas je sada dostupan i na francuskom, uz slovenski, engleski, hrvatski,
                        njemački, talijanski i mađarski.`,
                },
                {
                    title: "Oštrija karta",
                    text: `Karta je nacrtana iz vektorskih pločica, pa su imena mjesta oštra pri svakoj
                        razini približenja, a oznake stoje na mirnijoj podlozi.`,
                },
            ],
        },
    ],
};
