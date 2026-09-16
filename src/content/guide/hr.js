/* Upute za korištenje — hrvatski.
 * Prijevod ./en.js, koji je izvornik; kad se engleski tekst promijeni, uskladi
 * i ovaj. Oznake (id) odjeljaka ostaju iste kao u izvorniku, da sidra u adresi
 * rade u svim jezicima. Nazivi gumba i mogućnosti moraju se podudarati s
 * ../../i18n/hr.json.
 */

export default {
    title: "Upute za korištenje",

    intro: `Slovenski genetski atlas prikazuje rezultate Y-DNK (očinske linije) i mtDNK (majčinske
        linije) koje su priložili članovi projekta <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> pri FamilyTreeDNA, i to na karti i u dva
        stabla linija. Ove upute opisuju što koji prikaz pokazuje i kako s njim raditi.`,

    sections: [
        {
            id: "views",
            heading: "Tri prikaza",
            body: `
        <p>Poveznice na vrhu stranice prebacuju između tri prikaza. Svaki zadržava svoje stanje, pa
        možete prelaziti među njima bez gubitka mjesta na kojem ste stali.</p>
        <ul>
          <li><strong>Karta</strong> — gdje su živjeli najstariji poznati preci testiranih članova,
          obje linije istodobno.</li>
          <li><strong>Očinske linije (Y-DNK)</strong> — stablo kromosoma Y, koji se prenosi s oca na
          sina i u većini slovenskih obitelji prati prezime.</li>
          <li><strong>Majčinske linije (mtDNK)</strong> — stablo mitohondrijske DNK, koju majka
          prenosi na svu svoju djecu, ali se dalje nasljeđuje samo preko kćeri.</li>
        </ul>
        <p>Gumb s tri crte gore desno otvara i zatvara <strong>ploču</strong> s poljem za
        pretraživanje, filtrima linija i mogućnostima trenutnog prikaza. Na uskom zaslonu u nju se
        sele i poveznice na prikaze.</p>
        <p>Tri okrugla gumba lebde nad samim prikazom: <strong>i</strong> pokazuje dodatne obavijesti o
        prikazu, strelica izvozi ono što gledate, a krug s križićem vraća prikaz u početni
        položaj.</p>`,
        },
        {
            id: "map",
            heading: "Karta",
            body: `
        <p>Svaka oznaka jedan je testirani član, smješten na rodno mjesto njegova najstarijeg poznatog
        izravnog pretka. <strong>Kvadrati</strong> su očinski rezultati (Y-DNK), a
        <strong>krugovi</strong> majčinski (mtDNK); boja pokazuje glavnu genetsku grupu (haplogrupu)
        kojoj član pripada, pa srodne linije po cijeloj karti nose istu boju.</p>
        <p>Članovi iz istog mjesta našli bi se na posve istoj točki, pa su oznake s istom adresom
        raspoređene u jedan ili dva mala kruga oko nje. Približavanjem se razdvajaju.</p>
        <p>Klikom na oznaku otvaraju se njezini podaci: broj kompleta, obavljeni test, linija,
        haplogrupa, prezime, najstariji poznati predak i mjesto. Tri od njih su poveznice —
        <strong>broj kompleta</strong> otvara tu osobu u njezinu stablu linija,
        <strong>haplogrupa</strong> traži tu granu u stablu, a <strong>mjesto</strong> na karti traži
        sve koji iz njega potječu.</p>
        <p><strong>Prikaži oznake</strong> u ploči ispisuje uz svaku oznaku ime pretka (ili prezime).
        Podebljana imena pripadaju članovima koji su obavili najpotpuniji test za svoju liniju — Big Y
        za Y-DNK i puni mitohondrijski slijed za mtDNK.</p>`,
        },
        {
            id: "tree",
            heading: "Stablo linija",
            body: `
        <p>Stablo raste slijeva nadesno: najstariji zajednički preci su lijevo, a današnji testirani
        članovi listovi su na desnoj strani. Svaki okrugli čvor je haplogrupa — grana čovječanstva
        određena jednom mutacijom — a poznatije grane nose i opisno ime, pa se linija čita kao priča,
        a ne kao popis SNP oznaka.</p>
        <p>Stablo pomičete povlačenjem, a približavate kotačićem (ili prstima). Uska traka desno
        pregled je cijelog stabla s označenim trenutnim isječkom; klikom ili povlačenjem po njoj
        skačete drugamo. Zadržavanjem miša nad čvorom prikazuju se njegovi podaci, a nad članom ista
        kartica kao na karti.</p>
        <p>Klikom na haplogrupu sklapate granu ispod nje, a novim je klikom opet otvarate. Šuplje
        nacrtan čvor — obrubljen svojom bojom, ali neispunjen — iza sebe ima još nešto sklopljeno;
        pun čvor pokazuje sve što sadrži. Crte grana obojene su prema starosti grane, u skladu s
        legendom <strong>Razdoblja</strong> na dnu ploče.</p>
        <p>Tri mogućnosti u ploči određuju koliko se stabla crta:</p>
        <ul>
          <li><strong>Prikaži sve glavne genetske grupe</strong> — crta sve glavne haplogrupe, i one
          bez ijednog člana u projektu, pa se slovenske linije vide na svojem mjestu u ljudskom
          stablu.</li>
          <li><strong>Prikaži sve genetske varijante</strong> — zadržava međugrane koje nemaju vlastitog
          člana. Bez toga stablo skače ravno s jednog značajnog račvanja na sljedeće.</li>
          <li><strong>Prikaži samo linije</strong> — izostavlja pojedine članove i crta same grane, što
          znatno olakšava pregled oblika stabla.</li>
        </ul>`,
        },
        {
            id: "block-tree",
            heading: "Blokovno stablo",
            body: `
        <p>Kartice <strong>Stablo</strong> i <strong>Blokovno stablo</strong> na vrhu ploče mijenjaju
        način na koji je linija nacrtana. Ako je stablo o obliku, blokovno je stablo o
        <strong>vremenu</strong>: godine teku niz okomitu os od najstarije grane na vrhu do sadašnjosti
        na dnu, a svaka je grana blok nacrtan preko razdoblja u kojem je postojala kao jedna jedina
        linija, prije nego što se razdvojila.</p>
        <p>Svaki je blok označen svojom haplogrupom i obojen prema razdoblju. Zadržavanjem miša nad
        njim ispisuje se kada je grana nastala, kada je živio zajednički predak njezinih članova, 68- i
        99-postotni raspon te procjene, ekvivalentni SNP-ovi grane (kod mtDNK njezine mutacije) i
        koliko je ljudi FamilyTreeDNA testirao na njoj i ispod nje.</p>
        <p>Ispod blokova svaki član projekta dobiva svoju karticu pod granom do koje je testiran.
        Obojena kartica označava člana s najpotpunijim testom za njegovu liniju, a jantarna člana koji
        odgovara trenutnom pretraživanju.</p>
        <p>Klikom na blok prikaz se ponovno crta s tom granom kao novim polazištem — tako pratite jednu
        liniju u dubinu. Gumb <strong>↑</strong> i trag uz njega na vrhu prikaza vode natrag prema
        korijenu.</p>`,
        },
        {
            id: "search",
            heading: "Pretraživanje",
            body: `
        <p>Polje za pretraživanje u ploči pronalazi <strong>prezime</strong>, ime <strong>najstarijeg
        poznatog pretka</strong>, <strong>broj kompleta</strong>, <strong>mjesto</strong> i svaku
        haplogrupu na članovoj liniji. Pretraživanje po nadređenoj grani, primjerice
        <code>R-M420</code>, stoga pronalazi sve njezine potomke, a ne samo članove testirane točno do
        nje.</p>
        <p>Brojač ispod polja kaže koliko ljudi odgovara; kada ne odgovara nitko, tekst pocrveni.
        Pretraživanje vrijedi za otvoreni prikaz: na karti filtrira oznake, u stablu obrezuje grane na
        odgovarajuće linije, a u blokovnom stablu ističe članove koji odgovaraju.</p>`,
        },
        {
            id: "filters",
            heading: "Odabir linija",
            body: `
        <p>Popis <strong>Linije</strong> u ploči sadrži sve glavne genetske grupe prisutne u projektu,
        svaku s njezinom bojom na karti i brojem članova, uvučenu pod grupu iz koje potječe. Ako grupi
        maknete kvačicu, nestaje iz trenutnog prikaza; <strong>Odaberi sve</strong> i <strong>Poništi
        sve</strong> mijenjaju sve odjednom. Redak iznad popisa broji trenutno prikazane članove od
        svih. U prikazu linija odabir ili poništavanje kvačice ujedno pomiče stablo na tu granu.</p>
        <p>Na karti su ponuđena oba popisa, jer ona crta obje linije zajedno; u prikazu jedne linije
        samo njezin. <strong>Negrupirano</strong> okuplja članove čiji rezultati još nisu razvrstani u
        grupu; isključeno je unaprijed i, za razliku od ostalih filtara, ne pamti se u adresi.</p>
        <p>U stablu klik na haplogrupu koja je trenutno odfiltrirana umjesto sklapanja ponovno
        uključuje njezinu grupu, pa granu vraćate bez traženja po popisu.</p>`,
        },
        {
            id: "export",
            heading: "Izvoz prikaza",
            body: `
        <p>Gumb za preuzimanje izvozi točno ono što imate na zaslonu, s naslovom, navodom izvora i
        datumom: kartu kao sliku <strong>PNG</strong>, a stablo i blokovno stablo kao
        <strong>SVG</strong>. SVG zadržava tekst kao tekst i ostaje oštar u svakoj veličini, pa je
        bolji izbor za tiskani prikaz ili za sliku u dokumentu.</p>`,
        },
        {
            id: "sharing",
            heading: "Dijeljenje prikaza",
            body: `
        <p>Adresa u pregledniku čuva stanje atlasa — otvoreni prikaz, pretraživanje, odabrane linije,
        približenje i granu iz koje polazi blokovno stablo. Kopiranjem adrese stoga dijelite točno onaj
        prikaz koji gledate, a zabilješkom ga poslije vraćate.</p>`,
        },
        {
            id: "language",
            heading: "Jezik",
            body: `
        <p>Gumb sa zastavom u zaglavlju prebacuje atlas između slovenskog, engleskog, hrvatskog,
        njemačkog, talijanskog, mađarskog i francuskog. Odabir se pamti na vašem uređaju i vrijedi i za
        ove upute i za novosti.</p>`,
        },
        {
            id: "data",
            heading: "Odakle dolaze podaci",
            body: `
        <p>Prikazani su rezultati članova projekta <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> pri FamilyTreeDNA, zajedno s haplostablom,
        procjenama starosti i brojem testiranih koje objavljuje FamilyTreeDNA. Prikazuje se samo ono
        što je član u projektu odabrao učiniti javnim. Datum posljednjeg preuzimanja podataka nalazi se
        dolje lijevo na svakoj stranici.</p>
        <p>Atlas je dio projekta <a href="https://rodoslovje.si/slovenska-dnk" target="_blank"
        rel="noopener noreferrer">Slovensko genetsko nasljeđe</a> pri <a href="https://rodoslovje.si/"
        target="_blank" rel="noopener noreferrer">Slovenskom rodoslovnom društvu</a>. Ako ste se
        testirali kod FamilyTreeDNA i imate slovenske korijene, pristupanjem projektu svoju liniju
        dodajete u ovu sliku.</p>`,
        },
    ],
};
