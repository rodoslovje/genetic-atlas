/* Újdonságok — magyar.
 * A ./en.js fordítása; az angol az eredeti. Csak az oldal által mutatott
 * háromhavi ablakba eső bejegyzések vannak lefordítva; a régebbiek az angol
 * eredetiben maradnak, oda is íródnak. A hiányzó bejegyzés magától angolra
 * vált vissza.
 */

export default {
    title: "Újdonságok",

    intro: `Mi került az elmúlt három hónapban a Szlovén Genetikai Atlaszba, a legújabbal kezdve. Csak
        az új szolgáltatások és az atlasz működését érintő változások szerepelnek itt; a javítások és a
        rendszeres adatfrissítések nem. Minden korábbi a projekt <a
        href="https://github.com/rodoslovje/genetic-atlas/commits/main" target="_blank"
        rel="noopener noreferrer">GitHubon vezetett előzményeiben</a> található.`,

    entries: [
        {
            date: "2026-09-16",
            items: [
                {
                    title: "A blokkfa, a vonalak olvasásának második módja",
                    text: `Mindkét vonalnézetben megjelent a <em>Fa</em> és a <em>Blokkfa</em> fül. A
                        blokkfa az időt teszi a függőleges tengelyre: minden ág arra az időszakra
                        rajzolódik ki, amíg egyetlen vonalként létezett, közös ősének korával és e becslés
                        68 százalékos tartományával, egyenértékű SNP-jeivel, valamint a projekt minden
                        tagjával — kártyaként az alatt az ág alatt, ameddig tesztelték. Egy blokkra
                        kattintva lefelé követheti azt a vonalat, az eredményt pedig SVG-ként exportálhatja,
                        akárcsak bármely más nézetet.`,
                },
                {
                    title: "Felhasználói kézikönyv és ezek az újdonságok",
                    text: `Az atlasz alján futó sáv mostantól elvezet a <a
                        href="/guide/">felhasználói kézikönyvhöz</a>, amely sorra veszi az összes
                        nézetet és beállítást, valamint ezekhez az újdonságokhoz. Mindkettő saját
                        lapon nyílik meg, azon a nyelven, amelyen az atlaszt olvassa; a verzió és az
                        adatok dátuma pedig ugyanebbe a sávba került át.`,
                },
            ],
        },
        {
            date: "2026-08-28",
            items: [
                {
                    title: "Francia nyelv",
                    text: `Az atlasz mostantól franciául is elérhető, a szlovén, angol, horvát, német,
                        olasz és magyar mellett.`,
                },
                {
                    title: "Élesebb térkép",
                    text: `A térkép vektoros csempékből rajzolódik ki, így a helynevek minden nagyítási
                        szinten élesek maradnak, a jelölők pedig nyugodtabb háttéren állnak.`,
                },
            ],
        },
    ],
};
