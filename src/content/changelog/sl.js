/* Posodobitve — slovenščina.
 * Prevod ./en.js, ki je izvirnik. Prevedeni so le vnosi znotraj trimesečnega
 * okna, ki ga stran prikazuje; starejši ostanejo v angleškem izvirniku, kamor
 * se tudi zapisujejo. Manjkajoč vnos se sam povrne na angleščino.
 */

export default {
    title: "Posodobitve",

    intro: `Kaj je bilo v zadnjih treh mesecih dodano v Slovenski genetski atlas, najnovejše najprej.
        Navedene so le nove funkcije in spremembe delovanja atlasa; popravki in redne posodobitve
        podatkov ne. Vse starejše je v <a href="https://github.com/rodoslovje/genetic-atlas/commits/main"
        target="_blank" rel="noopener noreferrer">zgodovini projekta na GitHubu</a>.`,

    entries: [
        {
            date: "2026-09-16",
            items: [
                {
                    title: "Blokovno drevo, drugi način branja linije",
                    text: `Oba pogleda linij imata zdaj zavihka <em>Drevo</em> in <em>Blokovno drevo</em>.
                        Blokovno drevo postavi čas na navpično os: vsaka veja je narisana čez obdobje, ko
                        je obstajala kot ena sama linija, skupaj s starostjo svojega skupnega prednika in
                        68-odstotnim razponom te ocene, svojimi enakovrednimi SNP-ji in vsakim članom
                        projekta kot kartico pod vejo, do katere je bil testiran. S klikom na blok sledite
                        tej liniji navzdol, rezultat pa izvozite v SVG kot vsak drug pogled.`,
                },
                {
                    title: "Navodila za uporabo in te posodobitve",
                    text: `Vrstica na dnu atlasa zdaj vodi do <a href="/guide/">navodil za uporabo</a>,
                        ki po vrsti opišejo vsak pogled in vsako možnost, in do teh posodobitev. Oboje
                        se odpre v svojem zavihku, v jeziku, v katerem berete atlas, datuma izdaje in
                        podatkov pa sta se preselila v isto vrstico.`,
                },
            ],
        },
        {
            date: "2026-08-28",
            items: [
                {
                    title: "Francoščina",
                    text: `Atlas je zdaj na voljo tudi v francoščini, poleg slovenščine, angleščine,
                        hrvaščine, nemščine, italijanščine in madžarščine.`,
                },
                {
                    title: "Ostrejši zemljevid",
                    text: `Zemljevid je narisan iz vektorskih ploščic, zato so imena krajev ostra pri
                        vsaki stopnji približanja, oznake pa stojijo na mirnejšem ozadju.`,
                },
            ],
        },
    ],
};
