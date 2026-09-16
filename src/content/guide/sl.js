/* Navodila za uporabo — slovenščina.
 * Prevod ./en.js, ki je izvirnik; ob spremembi angleškega besedila posodobi
 * tudi tega. Imena (id) razdelkov ostanejo enaka kot v izvirniku, da sidra v
 * naslovu delujejo v vseh jezikih. Imena gumbov in možnosti se morajo ujemati
 * z ../../i18n/sl.json.
 */

export default {
    title: "Navodila za uporabo",

    intro: `Slovenski genetski atlas prikazuje rezultate Y-DNK (očetne linije) in mtDNK (materne
        linije), ki so jih prispevali člani projekta <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> pri FamilyTreeDNA, in sicer na zemljevidu in v
        dveh drevesih linij. Ta navodila opisujejo, kaj posamezni pogled prikazuje in kako z njim
        delati.`,

    sections: [
        {
            id: "views",
            heading: "Trije pogledi",
            body: `
        <p>Povezave na vrhu strani preklapljajo med tremi pogledi. Vsak ohrani svoje stanje, zato
        lahko prehajate med njimi, ne da bi izgubili mesto, kjer ste.</p>
        <ul>
          <li><strong>Zemljevid</strong> — kje so živeli najstarejši znani predniki testiranih članov,
          obe liniji hkrati.</li>
          <li><strong>Očetne linije (Y-DNK)</strong> — drevo kromosoma Y, ki se prenaša z očeta na
          sina in v večini slovenskih družin sledi priimku.</li>
          <li><strong>Materne linije (mtDNK)</strong> — drevo mitohondrijske DNK, ki jo mati prenese
          na vse svoje otroke, naprej pa se deduje le po hčerah.</li>
        </ul>
        <p>Gumb s tremi črtami zgoraj desno odpre in zapre <strong>ploščo</strong> s poljem za
        iskanje, filtri linij in možnostmi trenutnega pogleda. Na ozkem zaslonu se vanjo preselijo
        tudi povezave do pogledov.</p>
        <p>Trije okrogli gumbi lebdijo nad samim pogledom: <strong>i</strong> prikaže dodatne
        informacije o pogledu, puščica izvozi to, kar gledate, krog s križcem pa ponastavi pogled na
        izhodiščno lego.</p>`,
        },
        {
            id: "map",
            heading: "Zemljevid",
            body: `
        <p>Vsaka oznaka je en testiran član, postavljen na rojstni kraj njegovega najstarejšega
        znanega neposrednega prednika. <strong>Kvadrati</strong> so očetni rezultati (Y-DNK),
        <strong>krogi</strong> pa materni (mtDNK); barva pove glavno genetsko skupino (haploskupino),
        ki ji član pripada, zato sorodne linije po vsem zemljevidu nosijo isto barvo.</p>
        <p>Člani iz istega kraja bi pristali na povsem isti točki, zato so oznake z istim naslovom
        razporejene v enega ali dva majhna kroga okoli nje. Ko pogled približate, se ločijo.</p>
        <p>S klikom na oznako se odprejo njeni podatki: številka kompleta, opravljeni test, linija,
        haploskupina, priimek, najstarejši znani prednik in kraj. Trije med njimi so povezave —
        <strong>številka kompleta</strong> odpre to osebo v njenem drevesu linij,
        <strong>haploskupina</strong> poišče to vejo v drevesu, <strong>kraj</strong> pa na zemljevidu
        poišče vse, ki izhajajo iz njega.</p>
        <p><strong>Prikaži oznake</strong> v plošči izpiše ob vsaki oznaki ime prednika (ali priimek).
        Krepko zapisana imena pripadajo članom, ki so opravili najbolj poveden test za svojo linijo —
        Big Y za Y-DNK in polno mitohondrijsko zaporedje za mtDNK.</p>`,
        },
        {
            id: "tree",
            heading: "Drevo linij",
            body: `
        <p>Drevo raste od leve proti desni: najstarejši skupni predniki so na levi, današnji testirani
        člani pa so listi na desni. Vsako okroglo vozlišče je haploskupina — veja človeštva, ki jo
        določa ena mutacija — bolj znane veje pa nosijo tudi opisno ime, tako da se linija bere kot
        zgodba in ne kot seznam oznak SNP.</p>
        <p>Drevo premikate z vlečenjem, približujete pa z drsenjem (ali ščipom). Ozek pas na desni je
        pregled celotnega drevesa z označenim trenutnim izsekom; s klikom ali vlečenjem po njem
        skočite drugam. Ko postojite nad vozliščem, se izpišejo njegovi podatki, nad članom pa enaka
        kartica kot na zemljevidu.</p>
        <p>S klikom na haploskupino zložite vejo pod njo, z naslednjim klikom pa jo spet odprete.
        Votlo narisano vozlišče — obrobljeno v svoji barvi, a ne zapolnjeno — ima za seboj še nekaj
        zloženega; polno prikazuje vse, kar vsebuje. Črte vej so obarvane po starosti veje, skladno z
        legendo <strong>Obdobja</strong> na dnu plošče.</p>
        <p>Tri možnosti v plošči določajo, koliko drevesa se nariše:</p>
        <ul>
          <li><strong>Prikaži vse glavne genetske skupine</strong> — nariše vse glavne haploskupine,
          tudi tiste brez člana v projektu, tako da so slovenske linije vidne na svojem mestu v
          človeškem drevesu.</li>
          <li><strong>Prikaži vse genetske različke</strong> — ohrani vmesne veje, ki nimajo lastnega
          člana. Brez tega drevo skoči naravnost od ene pomenljive razcepitve do naslednje.</li>
          <li><strong>Prikaži samo linije</strong> — izpusti posamezne člane in nariše same veje, kar
          precej olajša pregled nad obliko drevesa.</li>
        </ul>`,
        },
        {
            id: "block-tree",
            heading: "Blokovno drevo",
            body: `
        <p>Zavihka <strong>Drevo</strong> in <strong>Blokovno drevo</strong> na vrhu plošče preklapljata
        način risanja linije. Če je drevo o obliki, je blokovno drevo o <strong>času</strong>: leta
        tečejo po navpični osi od najstarejše veje na vrhu do sedanjosti na dnu, vsaka veja pa je
        blok, narisan čez obdobje, ko je obstajala kot ena sama linija, preden se je razcepila.</p>
        <p>Vsak blok je označen s svojo haploskupino in obarvan po obdobju. Ko postojite nad njim, se
        izpiše, kdaj je veja nastala, kdaj je živel skupni prednik njenih članov, 68- in
        99-odstotni razpon te ocene, enakovredni SNP-ji veje (pri mtDNK njene mutacije) in koliko
        ljudi je FamilyTreeDNA testiral na njej in pod njo.</p>
        <p>Pod bloki dobi vsak član projekta svojo kartico pod vejo, do katere je bil testiran.
        Obarvana kartica označuje člana z najbolj povednim testom za njegovo linijo, jantarna pa
        člana, ki ustreza trenutnemu iskanju.</p>
        <p>S klikom na blok se pogled znova nariše s to vejo kot novim izhodiščem — tako sledite eni
        liniji v podrobnosti. Gumb <strong>↑</strong> in sled ob njem na vrhu pogleda vodita nazaj
        proti korenu.</p>`,
        },
        {
            id: "search",
            heading: "Iskanje",
            body: `
        <p>Iskalno polje v plošči ujame <strong>priimek</strong>, ime <strong>najstarejšega znanega
        prednika</strong>, <strong>številko kompleta</strong>, <strong>kraj</strong> in vsako
        haploskupino na članovi liniji. Iskanje po nadrejeni veji, na primer <code>R-M420</code>, zato
        najde vse njene potomce, ne le članov, testiranih točno do nje.</p>
        <p>Števec pod poljem pove, koliko ljudi ustreza; kadar ne ustreza nihče, se besedilo obarva
        rdeče. Iskanje velja za odprti pogled: na zemljevidu filtrira oznake, v drevesu obreže veje na
        ujemajoče se linije, v blokovnem drevesu pa poudari ujemajoče se člane.</p>`,
        },
        {
            id: "filters",
            heading: "Izbira linij",
            body: `
        <p>Seznam <strong>Linije</strong> v plošči vsebuje vse glavne genetske skupine v projektu,
        vsako z njeno barvo na zemljevidu in številom članov, zamaknjeno pod skupino, iz katere
        izhaja. Če skupini odvzamete kljukico, izgine iz trenutnega pogleda; <strong>Izberi
        vse</strong> in <strong>Počisti vse</strong> preklopita vse hkrati. Vrstica nad seznamom šteje
        trenutno prikazane člane od vseh. V pogledu linij izbira ali odvzem kljukice premakne drevo na
        to vejo.</p>
        <p>Na zemljevidu sta na voljo oba seznama, saj ta riše obe liniji hkrati; v pogledu ene linije
        le njen seznam. <strong>Nerazvrščeni</strong> zbirajo člane, katerih rezultati še niso uvrščeni
        v skupino; privzeto so izklopljeni in se, za razliko od drugih filtrov, ne shranijo v
        naslov.</p>
        <p>V drevesu klik na haploskupino, ki je trenutno odfiltrirana, namesto zlaganja spet vključi
        njeno skupino, tako da vejo prikličete nazaj, ne da bi jo iskali po seznamu.</p>`,
        },
        {
            id: "export",
            heading: "Izvoz pogleda",
            body: `
        <p>Gumb za prenos izvozi natanko to, kar imate na zaslonu, skupaj z naslovom, navedbo vira in
        datumom: zemljevid kot sliko <strong>PNG</strong>, drevo in blokovno drevo pa kot
        <strong>SVG</strong>. SVG ohrani besedilo kot besedilo in ostane oster pri vsaki velikosti,
        zato je boljša izbira za tiskan prikaz ali za sliko v dokumentu.</p>`,
        },
        {
            id: "sharing",
            heading: "Deljenje pogleda",
            body: `
        <p>Naslov v brskalniku hrani stanje atlasa — odprti pogled, iskanje, izbrane linije,
        približanje in vejo, iz katere izhaja blokovno drevo. S kopiranjem naslova torej delite
        natanko tak pogled, kot ga gledate, z zaznamkom pa ga pozneje prikličete nazaj.</p>`,
        },
        {
            id: "language",
            heading: "Jezik",
            body: `
        <p>Gumb z zastavo v glavi strani preklaplja atlas med slovenščino, angleščino, hrvaščino,
        nemščino, italijanščino, madžarščino in francoščino. Izbira se shrani v vaši napravi in velja
        tudi za ta navodila in za posodobitve.</p>`,
        },
        {
            id: "data",
            heading: "Od kod so podatki",
            body: `
        <p>Prikazani so rezultati članov projekta <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> pri FamilyTreeDNA, skupaj s haplodrevesom,
        ocenami starosti in števili testiranih, ki jih objavlja FamilyTreeDNA. Prikazano je le tisto,
        kar je član v projektu izbral za javno. Datum zadnjega prevzema podatkov je spodaj levo na
        vsaki strani.</p>
        <p>Atlas je del projekta <a href="https://rodoslovje.si/slovenska-dnk" target="_blank"
        rel="noopener noreferrer">Slovenska genetska dediščina</a> pri <a href="https://rodoslovje.si/"
        target="_blank" rel="noopener noreferrer">Slovenskem rodoslovnem društvu</a>. Če ste se
        testirali pri FamilyTreeDNA in imate slovenske korenine, s pridružitvijo projektu svojo linijo
        dodate v to sliko.</p>`,
        },
    ],
};
