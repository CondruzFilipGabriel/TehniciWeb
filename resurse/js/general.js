const themeContainer = document.getElementById("themes");
const themeSwitch = document.getElementById("themeSwitch");
const accordions = document.querySelectorAll('.accordion');

const lightState = "btn-warning";
const darkState = "btn-dark";
const themeKey = "light";

function toDark() {
    themeContainer.classList.remove(lightState);
    themeContainer.classList.add(darkState);
    document.body.classList.remove("light-theme-colors");
    document.body.classList.add("dark-theme-colors");
}

function toLight() {
    themeContainer.classList.remove(darkState);
    themeContainer.classList.add(lightState);
    document.body.classList.remove("dark-theme-colors");
    document.body.classList.add("light-theme-colors");
}

themeSwitch.addEventListener("change", function() {
    if (themeSwitch.checked) {
        toDark();
        localStorage.setItem(themeKey, "dark");
    } else {
        toLight();
        localStorage.setItem(themeKey, "light");
    }
});

function setThemeFromLocalStorage() {
    const selectedTheme = localStorage.getItem(themeKey);
    if (selectedTheme === "dark") {
        toDark();
        themeSwitch.checked = true;
    } else {
        toLight();
        themeSwitch.checked = false;
    }
}

document.addEventListener("DOMContentLoaded", setThemeFromLocalStorage);



// --------------------
// Etapa 7 - acordeonul
// --------------------
accordions.forEach((accordion) => {
    accordion.addEventListener('shown.bs.collapse', function (event) {
        const accordionId = accordion.id;
        localStorage.setItem(accordionId, 'expanded');
    });

    accordion.addEventListener('hidden.bs.collapse', function (event) {
        const accordionId = accordion.id;
        localStorage.setItem(accordionId, 'collapsed');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    accordions.forEach((accordion) => {
        const accordionId = accordion.id;
        const accordionState = localStorage.getItem(accordionId);
        const button = accordion.querySelector('.accordion-button');

        if (accordionState === 'collapsed') {
            accordion.querySelectorAll('.accordion-collapse').forEach((collapse) => {
                collapse.classList.remove('show');
                button.setAttribute('aria-expanded', 'false');
                button.classList.add('collapsed');
            });
        } else {
            accordion.querySelectorAll('.accordion-collapse').forEach((collapse) => {
                collapse.classList.add('show');
                button.setAttribute('aria-expanded', 'true');
                button.classList.remove('collapsed');
            });
        }
    });
}); 



// -------------------------
// Etapa 7 - animatie banner
// -------------------------
function setCookie(name, value, zile) {
    let durata = 5000;
    if(zile) {
        durata = zile * 24 * 60 * 60 * 1000;
    }
    const date = new Date();
    date.setTime(date.getTime() + durata);
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(name + '=');
    });
}

function deleteCookie(name, path, domain) {
    if(getCookie(name)) {
        document.cookie = name + "=" +
        ((path) ? ";path="+path:"") +
        ((domain)?";domain="+domain:"") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
    // console.log('deleted cookie', name);
}

function deleteAllCookies() {
    const cookies = decodeURIComponent(document.cookie).split("; ");
    for (let cookie of cookies) {
        deleteCookie(cookie.split('=')[0]);
    }
}

// setTimeout(deleteAllCookies, 10000);

let durataZileCookie = 0;

document.getElementById("accept-cookie").addEventListener("click", function () {
    setCookie("bannerAcceptat", "true", durataZileCookie);
    document.getElementById("banner").style.display = "none";
});

function updateLastVisitedUrlCookie() {
    const lastVisitedUrl = getCookie("lastVisitedUrl");
    const currentUrl = window.location.href;
    const cookieValue = lastVisitedUrl ? currentUrl : "first visit";
    setCookie("lastVisitedUrl", cookieValue, 1);

    document.getElementById("last-cookie").textContent = cookieValue;
}

window.onload = function () {
    const bannerAccepted = getCookie("bannerAccepted");
    if (bannerAccepted === "true") {
        document.getElementById("banner").style.display = "none";
    }
    updateLastVisitedUrlCookie();
};