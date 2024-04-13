const express = require("express");
const fs= require('fs');
const path=require('path');
// const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');

app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

app.set("view engine","ejs");

obGlobal = {
    obErori: null
}

vectFoldere = ["temp"];
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

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get(['/', '/index', '/home'], function(req, res) {
    res.render('pagini/index', { ip: req.ip });
});

app.get('/*.ejs', function(req, res) {
    afisareEroare(res, 400);
})

app.get('/despre', function(req, res) {
    res.render('pagini/despre');
});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(path.join(__dirname, 'resurse/ico/favicon.ico'));
});

app.get('/resurse/:a', function(req, res) {
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
console.log("Serverul a pornit");