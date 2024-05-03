const containerArticole = document.getElementById('lista-container');
const articles = document.querySelectorAll('article.produs-in-lista');
const textSearch = document.getElementById("text-search-area");
const datalistCategorie = document.getElementById("categorie");
const pret = document.getElementById('pret');
const abonamentSelect = document.getElementById('abonament');
const persoana = document.querySelectorAll('.btn-check');
const textarea = document.getElementById("textarea-description-search");
const textareaLabel = document.getElementById("form-floating-label");
const ore = document.querySelectorAll('.checkbox');
const dataSelect = document.getElementById('data');

let dataAleasa;
if(dataSelect) {
    dataAleasa = dataSelect.options[dataSelect.selectedIndex].value.trim();
    dataSelect.addEventListener('change', () => {
        dataAleasa = dataSelect.options[dataSelect.selectedIndex].value.trim();
    });
}

const filtreaza = document.getElementById('filter-button');
const ascendent = document.getElementById('sort-ascending-button');
const descendent = document.getElementById('sort-descending-button');
const calculeaza = document.getElementById('calculator-button');
const resetFilter = document.getElementById('filter-reset-button');

const defaultFilter = {
    text: "",
    categorie: "",
    pret: 0,
    abonament: "",
    persoana: "",
    textarea: "",
    ore: [
        '[00-02]', '[02-04]', '[04-06]', '[06-08]', 
        '[08-10]', '[10-12]', '[12-14]', '[14-16]', 
        '[16-18]', '[18-20]', '[20-22]', '[22-24]'
    ],
    data: ""
};

function optiuniAbonament() {
    let optiuni = [];
    for (let option of abonamentSelect.options) {
        if (option.selected) {
            optiuni.push(option.value);
        }
    }
    return optiuni;
}

function getPersoanaValue() {
    for (const elem of persoana) {
        if (elem.checked) {
            return elem.value;
        }
    }
    return "";
}

function getOre() {
    const oreSelectate = [];
    for(const elem of ore) {
        if(elem.checked) {
            oreSelectate.push(elem.value);
        }
    }
    return oreSelectate;
}

function ajustareOreInDate() {
    const currentDate = new Date();
    const luni = [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 
        'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 
        'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    const zile = [
        'Duminica', 'Luni', 'Marti', 
        'Miercuri', 'Joi', 'Vineri', 'Sambata'
    ];
    for (let i = 0; i <= 10; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + i);
        const formattedDate = `${date.getDate()}(${zile[date.getDay()]})/${luni[date.getMonth()]}/${date.getFullYear()}`;
        dataSelect.options[i+1].textContent = `${formattedDate}`;
        dataSelect.options[i+1].value = `${formattedDate}`;
    }
}

if (dataSelect) {
    ajustareOreInDate(); 
}

function isTextValid(text) {
    const regex = /^[a-zA-Z0-9 .]*$/;
    const isValid = regex.test(text);
    if (!isValid) {
        alert("Textul continne caractere nepermise. Puteti introduce doar litere, cifre, spariu si punct.");
    }
    return isValid;
}

function textareaValidityCheck(text) {
    if(!text) return true;
    const digitRegex = /\d/;
    const wordRegex = /^([a-zA-Z]+,?)*[a-zA-Z]+$/;
    if (digitRegex.test(text) || !wordRegex.test(text)) {
        return false;
    }
    return true;
}

// textarea
function validateTextarea() {
    if (!textareaValidityCheck(textarea.value)) {
        textareaLabel.classList.remove("form-floating-label");
        textarea.classList.add("is-invalid");
    } else {
        textareaLabel.classList.add("form-floating-label");
        textarea.classList.remove("is-invalid");
    }
}

if(textarea) {
    textarea.addEventListener('input', validateTextarea);    
    validateTextarea();
}




// -------------------
// butonul de filtrare
// -------------------
function eDataAnterioara(data1, data2) {
    const luni = {
        'Ianuarie': 0, 'Februarie': 1, 'Martie': 2, 'Aprilie': 3,
        'Mai': 4, 'Iunie': 5, 'Iulie': 6, 'August': 7,
        'Septembrie': 8, 'Octombrie': 9, 'Noiembrie': 10, 'Decembrie': 11
    };

    const [ziua1, luna1, anul1] = data1.split('/');
    const [ziua2, luna2, anul2] = data2.split('/');

    const primaData = new Date(anul1, luni[luna1], parseInt(ziua1));
    const aDouaData = new Date(anul2, luni[luna2], parseInt(ziua2));

    return primaData <= aDouaData;
}

function filterArticles() {
    const filteredArticles = [];

    articles.forEach(article => {
        const numeArticle = article.querySelector('h3#prod-nume').textContent.toLowerCase();
        const categorieArticle = article.querySelector('span#prod-categorie').textContent.toLowerCase().split('\n')[2].trim();
        const pretArticle = parseInt(article.querySelector('span#prod-pret').textContent);
        const abonamentArticle = article.querySelector('span#prod-abonament').textContent;
        const oreArticle = article.querySelector('span#prod-ore').textContent;
        const disponibilArticle = article.querySelector('span#prod-disponibil').textContent.trim();
        const valoriOre = getOre();
        const pretFilter = parseInt(pret.value);
        const filtreAbonament = optiuniAbonament();

        if (
            (textSearch.value == "" || numeArticle.includes(textSearch.value.toLowerCase())) &&
            (!datalistCategorie.value || categorieArticle.includes(datalistCategorie.toLowerCase())) &&
            (!(pretFilter > 0) || pretArticle < pretFilter) &&
            (!(filtreAbonament.length > 0) || filtreAbonament.some(filteredAb => abonamentArticle == filteredAb)) &&
            (!(valoriOre.length > 0) || valoriOre.some(oraSelectata => oreArticle.includes(oraSelectata))) &&
            (dataAleasa == "" || eDataAnterioara(dataAleasa, disponibilArticle))
        ) {
            filteredArticles.push(article);
        }
    });

    return filteredArticles;
}

function updateArticles(articles) {
    containerArticole.innerHTML = '';
    articles.forEach(article => {
        containerArticole.appendChild(article);
    });
}

if(filtreaza) {
    filtreaza.addEventListener('click', function() {
        const textareaValidity = textareaValidityCheck(textarea.value);
        const textValidity = isTextValid(textSearch.value);
        if(!textareaValidity || !textValidity) {
            alert("Nu ati completat corect filtrele! Va rugam corectati!");
        } else {
            updateArticles(filterArticles());
        }
    });
}



// ------------------------------
// butonul de sortare crescatoare
// ------------------------------
function sortArticles(order) {
    let articlesArr = [...document.querySelectorAll('article.produs-in-lista')];
    articlesArr.sort((a, b) => {
        const priceSpanA = a.querySelector('span#prod-pret');
        const priceSpanB = b.querySelector('span#prod-pret');

        const priceA = parseInt(priceSpanA.textContent.trim());
        const priceB = parseInt(priceSpanB.textContent.trim());

        if (priceA !== priceB) {
            return order === 'ascending' ? priceA - priceB : priceB - priceA;
        } else {
            const oreSpanA = a.querySelector('span#prod-ore').textContent;
            const oreSpanB = b.querySelector('span#prod-ore').textContent;
            return order === 'ascending' ? oreSpanA.localeCompare(oreSpanB) : oreSpanB.localeCompare(oreSpanA);
        }
    });
    
    updateArticles(articlesArr);
}

if(ascendent) {
    ascendent.addEventListener('click', function() {
        sortArticles('ascending');
    });
}



// ---------------------------------
// butonul de sortare descrescatoare
// ---------------------------------
if(descendent) {
    descendent.addEventListener('click', function() {
        sortArticles('descending')
    });
}



// -----------------------------
// butonul care calculeaza media
// -----------------------------

// functia care calculeaza pretul mediu
function calculeazaPretulMediu() {
    let sum = 0;
    articles.forEach(article => {
        const priceSpan = article.querySelector('span#prod-pret');
        sum += parseInt(priceSpan.textContent.trim());
    });
    const nr = articles.length;
    const average = nr ? sum / nr : 0;

    return average;
}

// crearea si afisarea divului cu media
function afiseazaPretulMediu() {
    const averagePrice = calculeazaPretulMediu();

    const div = document.createElement('div');

    div.textContent = `Pretul mediu: ${averagePrice.toFixed(2)} lei`;
    div.style.position = 'fixed';
    div.style.top = '20%';
    div.style.left = '40%';
    div.style.background = 'rgba(255, 255, 255, 0.8)';
    div.style.padding = '10px';
    div.style.border = '1px solid #ccc';
    div.style.borderRadius = '5px';
    div.style.zIndex = '9999';

    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 2000);
}

if(calculeaza) {
    calculeaza.addEventListener('click', afiseazaPretulMediu);
}



// -----------------------
// butonul de reset filter
// -----------------------
if(resetFilter) {
    resetFilter.addEventListener('click', function() {
        document.getElementById("text-search-area").value = defaultFilter.text;
        document.getElementById("categorie").value = defaultFilter.categorie;
        document.getElementById('pret').value = defaultFilter.pret;
        document.getElementById('abonament').value = defaultFilter.abonament;
        document.querySelectorAll('.btn-check').forEach(radio => {
            radio.checked = (radio.value === defaultFilter.persoana);
        });
        document.getElementById("textarea-description-search").value = defaultFilter.textarea;
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.checked = defaultFilter.ore.includes(checkbox.value);
        });
        document.getElementById('data').value = defaultFilter.data;
    });
}