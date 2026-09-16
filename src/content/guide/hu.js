/* Felhasználói kézikönyv — magyar.
 * A ./en.js fordítása; az angol az eredeti, annak változásakor ezt is
 * frissíteni kell. A szakaszok id-jei az eredetiével egyeznek, hogy a címben
 * szereplő horgonyok minden nyelven működjenek. A gombok és beállítások nevének
 * meg kell egyeznie a ../../i18n/hu.json tartalmával.
 */

export default {
    title: "Felhasználói kézikönyv",

    intro: `A Szlovén Genetikai Atlasz a FamilyTreeDNA <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> projektje tagjainak Y-DNS- (apai vonal) és
        mtDNS-eredményeit (anyai vonal) mutatja be: térképen és két vonalfán. Ez a kézikönyv végigveszi,
        mit mutat az egyes nézetek, és hogyan lehet velük dolgozni.`,

    sections: [
        {
            id: "views",
            heading: "A három nézet",
            body: `
        <p>Az oldal tetején lévő hivatkozások váltanak a három nézet között. Mindegyik megőrzi a saját
        állapotát, így úgy válthat közöttük, hogy nem veszíti el, hol tartott.</p>
        <ul>
          <li><strong>Térkép</strong> — hol éltek a tesztelt tagok legkorábbi ismert ősei, mindkét
          vonal egyszerre.</li>
          <li><strong>Apasági Vonalak (Y-DNA)</strong> — az Y kromoszóma fája, amely apáról fiúra
          öröklődik, és a legtöbb szlovén családban a vezetéknevet követi.</li>
          <li><strong>Anyasági Vonalak (mtDNA)</strong> — a mitokondriális DNS fája, amelyet az anya
          minden gyermekének továbbad, de amely csak a leányágon öröklődik tovább.</li>
        </ul>
        <p>A jobb felső sarokban lévő háromvonalas gomb nyitja és zárja azt az <strong>oldalsávot</strong>,
        amelyben a keresőmező, a vonalszűrők és az aktuális nézet beállításai vannak. Keskeny képernyőn a
        nézetek hivatkozásai is ide kerülnek.</p>
        <p>Három kerek gomb lebeg magán a nézeten: az <strong>i</strong> háttérinformációt mutat a
        nézetről, a nyíl exportálja, amit éppen lát, a keresztes kör pedig visszaállítja a nézetet a
        kiinduló helyzetébe.</p>`,
        },
        {
            id: "map",
            heading: "A térkép",
            body: `
        <p>Minden jelölő egy tesztelt tag, a legkorábbi ismert egyenes ági ősének születési helyén. A
        <strong>négyzetek</strong> apai (Y-DNS), a <strong>körök</strong> anyai (mtDNS) eredmények; a
        szín azt a fő genetikai csoportot (haplocsoportot) jelöli, amelyhez a tag tartozik, így a rokon
        vonalak az egész térképen ugyanazt a színt viselik.</p>
        <p>Az azonos helyről származó tagok pontosan ugyanarra a pontra esnének, ezért az azonos címen
        lévő jelölők egy vagy két kis gyűrűben oszlanak el körülötte. Ránagyítva különválnak.</p>
        <p>A jelölőre kattintva megnyílnak az adatai: a készlet száma, az elvégzett teszt, a vonal, a
        haplocsoport, a vezetéknév, a legkorábbi ismert ős és a hely. Ezek közül három hivatkozás: a
        <strong>készlet száma</strong> megnyitja az illetőt a saját vonalfájában, a
        <strong>haplocsoport</strong> megkeresi azt az ágat a fán, a <strong>hely</strong> pedig a
        térképen keresi meg mindazokat, akik onnan származnak.</p>
        <p>A <strong>Címkék megjelenítése</strong> az oldalsávban minden jelölő mellé kiírja az ős nevét
        (vagy a vezetéknevet). A félkövér nevek azoké a tagoké, akik a vonalukra nézve a legtöbbet eláruló
        tesztet végezték el — Y-DNS esetén a Big Y-t, mtDNS esetén a teljes mitokondriális szekvenciát.</p>`,
        },
        {
            id: "tree",
            heading: "A vonalfa",
            body: `
        <p>A fa balról jobbra nő: a legrégebbi közös ősök balra, a ma tesztelt tagok levélként jobbra
        kerülnek. Minden kerek csomópont egy haplocsoport — az emberiség egy ága, amelyet egyetlen mutáció
        határoz meg —, az ismertebb ágak pedig leíró nevet is viselnek, így a vonal történetként olvasható,
        nem SNP-kódok listájaként.</p>
        <p>Húzással mozgatja a fát, görgetéssel (vagy csippentéssel) nagyít. A jobb oldali keskeny sáv az
        egész fa áttekintése, rajta a jelenlegi kivágattal; kattintással vagy húzással bárhová ugorhat.
        Ha egy csomópont fölött megáll, megjelennek az adatai, egy tag fölött pedig ugyanaz a kártya, mint
        a térképen.</p>
        <p>Egy haplocsoportra kattintva összecsukja az alatta lévő ágat, újabb kattintásra ismét kinyitja.
        Az üresen rajzolt csomópont — a saját színével keretezve, de kitöltetlenül — még rejt valamit maga
        mögött; a tömör mindent mutat, amit tartalmaz. Az ágak vonalai az ág kora szerint színeződnek, az
        oldalsáv alján lévő <strong>Korszakok</strong> jelmagyarázat szerint.</p>
        <p>Az oldalsáv három beállítása dönti el, mennyi rajzolódik ki a fából:</p>
        <ul>
          <li><strong>Minden fő genetikai csoport megjelenítése</strong> — kirajzolja az összes nagy
          haplocsoportot, azokat is, amelyekhez nincs tag a projektben, így a szlovén vonalak a maguk
          helyén látszanak az emberiség fáján.</li>
          <li><strong>Összes genetikai variáns mutatása</strong> — megtartja azokat a közbenső ágakat is,
          amelyeknek nincs saját tagjuk. Enélkül a fa az egyik érdemi elágazásról egyenesen a következőre
          ugrik.</li>
          <li><strong>Csak a vonalak megjelenítése</strong> — elhagyja az egyes tagokat, és csak az ágakat
          rajzolja ki, amitől a fa alakja sokkal áttekinthetőbb lesz.</li>
        </ul>`,
        },
        {
            id: "block-tree",
            heading: "A blokkfa",
            body: `
        <p>Az oldalsáv tetején lévő <strong>Fa</strong> és <strong>Blokkfa</strong> fül váltja, hogyan
        rajzolódik ki egy vonal. Ha a fa az alakról szól, a blokkfa az <strong>időről</strong>: az évek a
        függőleges tengelyen futnak lefelé, a legrégebbi ágtól a jelenig, és minden ág egy blokk, amely
        arra az időszakra rajzolódik, amíg az ág egyetlen vonalként létezett, mielőtt kettévált volna.</p>
        <p>Minden blokkon ott a haplocsoportja, színe pedig a korszakát követi. Fölé érve kiderül, mikor
        alakult ki az ág, mikor élt tagjainak közös őse, mekkora e becslés 68 és 99 százalékos tartománya,
        melyek az ág egyenértékű SNP-jei (mtDNS esetén a mutációi), és hány embert tesztelt a
        FamilyTreeDNA az ágon és alatta.</p>
        <p>A blokkok alatt a projekt minden tagja saját kártyát kap az alatt az ág alatt, ameddig
        tesztelték. A színezett kártya azt a tagot jelöli, aki a vonalára nézve a legtöbbet eláruló tesztet
        végezte el, a borostyánsárga pedig azt, aki megfelel az aktuális keresésnek.</p>
        <p>Egy blokkra kattintva a nézet újrarajzolódik úgy, hogy az az ág lesz az új kiindulópont — így
        követhet egyetlen vonalat a részletekig. A nézet tetején lévő <strong>↑</strong> gomb és a mellette
        húzódó útvonal vezet vissza a gyökér felé.</p>`,
        },
        {
            id: "search",
            heading: "Keresés",
            body: `
        <p>Az oldalsáv keresőmezője megtalálja a <strong>vezetéknevet</strong>, a <strong>legkorábbi ismert
        ős</strong> nevét, a <strong>készlet számát</strong>, a <strong>helyet</strong>, valamint minden
        haplocsoportot a tag vonalán. Egy feljebbi ágra, például az <code>R-M420</code>-ra keresve tehát
        annak minden leszármazottja előkerül, nem csak azok a tagok, akiket pontosan addig teszteltek.</p>
        <p>A mező alatti számláló mutatja, hányan felelnek meg; ha senki, a szöveg pirosra vált. A keresés
        a megnyitott nézetre vonatkozik: a térképen szűri a jelölőket, a fán a megfelelő vonalakra metszi,
        a blokkfában pedig kiemeli a megtalált tagokat.</p>`,
        },
        {
            id: "filters",
            heading: "Vonalak kiválasztása",
            body: `
        <p>Az oldalsáv <strong>Vonalak</strong> listája a projektben előforduló összes fő genetikai
        csoportot tartalmazza, mindegyiket a térképen használt színével és tagjainak számával, annak a
        csoportnak alá behúzva, amelyből származik. Egy csoport pipáját kivéve az eltűnik az aktuális
        nézetből; az <strong>Összes kijelölése</strong> és a <strong>Kijelölés törlése</strong> egyszerre
        kapcsolja mindet. A lista fölötti sor az éppen megjelenített tagokat számolja az összeshez képest.
        Vonalnézetben a pipa be- vagy kikapcsolása egyben arra az ágra is viszi a fát.</p>
        <p>A térképen mindkét lista elérhető, hiszen az mindkét vonalat együtt rajzolja; egy vonalnézetben
        csak a sajátja. A <strong>Nem csoportosított</strong> azokat a tagokat gyűjti össze, akiknek az
        eredményei még nincsenek csoportba sorolva; alapértelmezés szerint ki van kapcsolva, és a többi
        szűrővel ellentétben a címben sem őrződik meg.</p>
        <p>A fán az éppen kiszűrt haplocsoportra kattintva összecsukás helyett visszakapcsolódik a
        csoportja, így az ág anélkül kerül elő, hogy a listában kellene megkeresni.</p>`,
        },
        {
            id: "export",
            heading: "Nézet exportálása",
            body: `
        <p>A letöltés gomb pontosan azt exportálja, ami a képernyőn van, fejléccel, forrásmegjelöléssel és
        dátummal: a térképet <strong>PNG</strong> képként, a fát és a blokkfát pedig
        <strong>SVG</strong>-ként. Az SVG szövegként őrzi meg a szöveget, és minden méretben éles marad,
        ezért nyomtatott ábrához vagy dokumentumba illesztett képhez ez a jobb választás.</p>`,
        },
        {
            id: "sharing",
            heading: "A látvány megosztása",
            body: `
        <p>A böngésző címsora őrzi az atlasz állapotát — a megnyitott nézetet, a keresést, a kiválasztott
        vonalakat, a nagyítást és azt az ágat, amelyből a blokkfa indul. A cím másolásával tehát pontosan
        azt a nézetet osztja meg, amelyet maga is lát, könyvjelzővel pedig később visszatalál hozzá.</p>`,
        },
        {
            id: "language",
            heading: "Nyelv",
            body: `
        <p>A fejlécben lévő zászlós gomb szlovén, angol, horvát, német, olasz, magyar és francia nyelv
        között vált. A választás az eszközén megőrződik, és erre a kézikönyvre meg az újdonságokra is
        érvényes.</p>`,
        },
        {
            id: "data",
            heading: "Honnan származnak az adatok",
            body: `
        <p>Az eredmények a FamilyTreeDNA <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> projektje tagjaitól származnak, a FamilyTreeDNA
        által közzétett haplofával, korbecslésekkel és tesztelői számokkal együtt. Csak az jelenik meg,
        amit a tag a projektben nyilvánossá tett. Az adatok utolsó átvételének dátuma minden oldal bal
        alsó sarkában olvasható.</p>
        <p>Az atlasz a <a href="https://rodoslovje.si/" target="_blank" rel="noopener noreferrer">Szlovén
        Genealógiai Társaság</a> <a href="https://rodoslovje.si/slovenska-dnk" target="_blank"
        rel="noopener noreferrer">Szlovén Genetikai Örökség</a> projektjének része. Ha tesztelt a
        FamilyTreeDNA-nál és szlovén gyökerei vannak, a projekthez csatlakozva a saját vonalával
        egészítheti ki ezt a képet.</p>`,
        },
    ],
};
