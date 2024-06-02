const express = require("express");
const fs= require('fs');
const path=require('path');
const sass=require('sass');
const { Client } = require('pg');
// const sharp=require('sharp');
// const ejs=require('ejs');

obGlobal = {
    obErori: null,
    obGalerie: null,
    objProduse: null,
    noDB: false
}

const client = new Client({
    user: 'filip',
    password: '12341234',
    host: '127.0.0.1',
    port: '5432',
    database: 'tw'
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS proiecttw (
  id INTEGER PRIMARY KEY,
  nume TEXT,
  descriere TEXT,
  imagine TEXT,
  categorie TEXT,
  rating TEXT,
  pret INTEGER,
  discount INTEGER,
  disponibil INTEGER,
  abonament TEXT,
  ore TEXT[],
  persoana_fizica BOOLEAN
)`;

const insertValuesQuery = `
INSERT INTO proiecttw (id, nume, descriere, imagine, categorie, rating, pret, discount, disponibil, abonament, ore, persoana_fizica)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

async function initialPopulateDB() {
    let continut = JSON.parse(fs.readFileSync(path.join(__dirname, 'resurse/json/produse.json')).toString('utf-8'));

    for (let prod of continut.produse) {
        prod.imagine = path.join(continut.cale_produse, prod.imagine);
    }

    try {
        await client.query(createTableQuery);
        for(const item of continut.produse) {
            // console.log(item);
            const valoriDeInserat = [
                item.id,
                item.nume,
                item.descriere,
                item.imagine,
                item.categorie,
                item.rating,
                item.pret,
                item.discount,
                item.disponibil,
                item.abonament,
                item.ore,
                item.persoana_fizica
            ];
            await client.query(insertValuesQuery, valoriDeInserat);
        }
        console.log('Crearea si popularea initiala a tabelului a fost realizata cu succes.');
    } catch (err) {
        console.log("A survenit o eroare in popularea initiala a bazei de date.", err);
    }
}

if(obGlobal.noDB == false) {
    client
        .connect()
        .then(() => {
            console.log('Conectare reusita la baza de date PostgreSQL!');
            // initialPopulateDB();
                const query = 'SELECT * FROM proiecttw';
                client.query(query)
                    .then(result => {
                        obGlobal.obProduse = result.rows;
                        // console.log(obGlobal.obProduse);
                        client.end();
                    })
                    .catch(error => {
                        console.error('Error executing query:', error);
                        client.end();
                    });
                })
                .catch((err) => {
                    console.error('A survenit o eroare in conectarea la baza de date PostgreSQL: ', err, '.');
                });
}

app = express();

console.log("Folder proiect (__dirname): \n", __dirname);
console.log("Cale fisier (__filename): \n", __filename);
console.log("Director de lucru (process.cwd()): \n", process.cwd());

app.set("view engine","ejs");

vectFoldere = ["temp", "backup"];
for (let folder of vectFoldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdir(caleFolder, (err) => {
            if (err) {
              console.error('Folderul nu a putut fi creat. Eroare:', err);
            }
        });
    }
}

let folderScss = path.join(__dirname, "resurse/sass");
let folderCss = path.join(__dirname, "resurse/css");

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        const scssFile = path.parse(caleScss).name;
        caleCss = path.join(folderCss, `${scssFile}.css`);
    }
    if(!path.isAbsolute(caleScss)) {
        caleScss = path.join(folderScss, caleScss);
    }
    if(!path.isAbsolute(caleCss)) {
        caleCss = path.join(folderCss, caleCss);
    }

    if (fs.existsSync(caleCss)) {
        const backupFolder = path.join(__dirname, 'backup/resurse/css');
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder, { recursive: true });
        }
        const cssFile = path.basename(caleCss);
        const backupFilePath = path.join(backupFolder, cssFile);

        fs.copyFile(caleCss, backupFilePath, (err) => {
            if(err) {
                console.error(`A survenit o eroare in copierea fisierului css in folderul de backup: ${err}`);
            } 
            // else {
            //     console.log(`Fisierul CSS '${caleCss}' a fost copiat in folderul de backup.`);
            // }
        });
    }

    const sassCode = fs.readFileSync(caleScss, 'utf8');
    const compiledCss = sass.renderSync({
        data: sassCode
    });
    fs.writeFileSync(caleCss, compiledCss.css);
    // console.log(`Fisierul Sass '${caleScss}' a fost compilat cu succes in '${caleCss}'!`);
}

function compileazaTotScss() {
    fs.readdir(folderScss, (err, files) => {
        if (err) {
            console.error(`Nu poate fi citit folderul: ${err}`);
            return;
        }
        files.forEach(file => {
            if (path.extname(file) === '.scss') {
                compileazaScss(file);
            }
        });
    });

    fs.watch(folderScss, (eventType, filename) => {
        if (path.extname(filename) === '.scss') {
            // console.log(`Au fost detectate schimbari in folderul sass: ${filename}. Se compileaza...`);
            compileazaScss(filename);
        }
    });
    // console.log(`Se monitorizeaza modificarile in folderul ${folderScss} ...`);
}

compileazaTotScss();

function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, 'resurse/json/erori.json')).toString('utf-8');
    obGlobal.obErori = JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
    let err_def = obGlobal.obErori.eroare_default;
    err_def.imagine = path.join(obGlobal.obErori.cale_baza, err_def.imagine);
};

initErori();

function afisareEroare(res, _identificator, _titlu, _text, _imagine) {
    let eroare = obGlobal.obErori.info_erori.find((elem) => {
        elem.identificator == _identificator;
        if(elem.identificator == _identificator) {
            res.render('pagini/eroare', {
                titlu: _titlu || elem.titlu,
                text: _text || elem.text,
                imagine: _imagine || elem.imagine
            });
        }
    });
    if(!eroare) {
        eroare = obGlobal.obErori.eroare_default;
    }
}

function initGalerie() {
    let continut = fs.readFileSync(path.join(__dirname, 'resurse/json/galerie.json')).toString('utf-8');
    obGlobal.obGalerie = JSON.parse(continut);
    for (let imagine of obGlobal.obGalerie.imagini) {
        imagine.nume_mare = path.join(obGlobal.obGalerie.cale_galerie, imagine.nume_mare);
        imagine.nume_mediu = path.join(obGlobal.obGalerie.cale_galerie, imagine.nume_mediu);
        imagine.nume_mic = path.join(obGlobal.obGalerie.cale_galerie, imagine.nume_mic);
    }
}

initGalerie();

function perioadaDinZi() {
    let ora = new Date().getHours();
    let timp = "";
    if (ora >= 5 && ora < 12 ) timp = "dimineata";
    else if(ora >= 12 && ora < 20) timp = "zi";
    else timp = "noapte";
    return timp;
}

function filtrareGalerie(res, _perioada_din_zi) {
    if(!_perioada_din_zi) _perioada_din_zi = perioadaDinZi();
    
    // _perioada_din_zi = "noapte";
    // let galerie = obGlobal.obGalerie.imagini;

    let galerie = obGlobal.obGalerie.imagini.filter(elem => elem.timp == _perioada_din_zi);
    return galerie;
}

function galerieBanner() {
    let imagini = obGlobal.obGalerie.imagini;
    offset = Math.floor(Math.random() * 16);
    nrImagini = (Math.floor(Math.random() * Math.floor((imagini.length - offset) / 3)) + 1) * 3;    
    let galerie_banner = [];
    for(let i = offset; i < offset + nrImagini; ++i) {
        galerie_banner.push(imagini[i]);
    }
    return galerie_banner;
}

function afisareGalerie(res, _perioada_din_zi) {
    let galerie = filtrareGalerie(res, _perioada_din_zi);
    let galerie_banner = galerieBanner();
    res.render('pagini/market', { "galerie": galerie, "galerieBanner": galerie_banner });
}

// functie care incarca produsele din JSON (ante-config. BD)
function initProduse() {
    let continut = JSON.parse(fs.readFileSync(path.join(__dirname, 'resurse/json/produse.json')).toString('utf-8'));
    obGlobal.obProduse = continut.produse;
    for (let produs of obGlobal.obProduse) {
        produs.imagine = path.join(continut.cale_produse, produs.imagine);
    }
};

if(obGlobal.noDB == true) {
    initProduse();
}


app.use("/resurse", express.static(path.join(__dirname, "resurse")));
app.use("/node_modules/bootstrap-icons", express.static(path.join(__dirname, "node_modules/bootstrap-icons")));
app.use("/",express.static("./node_modules/bootstrap/dist/"));

app.get(['/', '/index', '/home'], function(req, res) {
    let galerie_banner = galerieBanner();
    let filtrare_galerie = filtrareGalerie();
    res.render('pagini/index', { ip: req.ip, "galerie": filtrare_galerie, "galerieBanner": galerie_banner });
});

app.get('/*.ejs', function(req, res) {
    afisareEroare(res, 400);
})

app.get('/despre', function(req, res) {
    res.render('pagini/despre');
});

app.get('/market', function(req, res) {
    afisareGalerie(res);
});

app.get('/produse', (req, res) => {
    if(!req.query.categorie) {
        res.render('pagini/produse', { "produse": obGlobal.obProduse });
    }
    else if(req.query.categorie !== "") {
        let filtruCategorie = obGlobal.obProduse.filter((produs) => produs.categorie == req.query.categorie);
        res.render('pagini/produse', { 
            "produse": filtruCategorie
        });
    }
});

app.get('/produs/:id', (req, res) => {
    id = req.params.id;
    res.render('pagini/produs', { "produs": obGlobal.obProduse[parseInt(id) - 1] });
});

app.get('/users', (req, res) => {
    res.render('pagini/users');
})

app.get('/cos', (req, res) => {
    res.render('pagini/cos');
})

app.get('/favicon.ico', function(req, res) {
    res.sendFile(path.join(__dirname, 'resurse/ico/favicon.ico'));
});

app.get(new RegExp("^\/reusrse\/[a-zA-Z0-9_\/-]+\/&"), function(req, res) {
    // ^\/reusrse\/[a-zA-Z0-9_\/-]+\/& <=> /resurse/.../
    // https://regex101.com
    afisareEroare(res, 403);
});

app.get('/*', function(req, res) {
    try {
            res.render('pagini/'+req.url, function(eroare, rezultatRandare) {
            if (!eroare) {
                rezultatRandare.send(rezultatRandare);
            } else {
                if(eroare.message.startsWith('Failed to lookup view')) {
                    afisareEroare(res, 404);
                    console.log('Nu a gasit pagina: ', req.url);
                }
                else {
                    afisareEroare(res);
                    console.log(obGlobal.obErori.eroare_default.text);
                }
            }
        });
    }
    catch (err1) {
        if(err1.message.startsWith('Cannot find module')) {
            afisareEroare(res, 404);
            console.log('Nu a gasit resurse: ', req.url);
            return;
        }
        afisareEroare(res);
    }
});

app.listen(8080);
console.log("Serverul a pornit!");