document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5500/polaganje')
        .then(response => response.json())
        .then(data => loadHTMLTable(data['data']))
        .catch(error => alert(`Greska pri učitavanju podataka iz baze! \n ${error}`));
});

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');
    let tableHtml = "";

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>Nema Podataka</td></tr>";
    } else {

        data.forEach(function ({ broj_indeksa, ime_prezime, studijski_program, ispiti }) {
            tableHtml += `<tr data-id=${broj_indeksa}>`;
            tableHtml += `<td class="master">${broj_indeksa}</td>`;
            tableHtml += `<td class="master">${ime_prezime}</td>`;
            tableHtml += `<td class="master">${studijski_program}</td>`;
            tableHtml += "</tr>";

            if (ispiti.length > 0) {
                tableHtml += `<ul class=detail-list id=${broj_indeksa}-list>`;
                ispiti.forEach(function ({ naziv, ocena }) {
                    tableHtml += `<li>${naziv} - ${ocena}</li>`;
                })
                tableHtml += "</ul>";
            } else {
                tableHtml += `<ul class=detail-list id=${broj_indeksa}-list>`;
                tableHtml += `<li>Ovaj student još nije polagao ispite</li>`;
                tableHtml += "</ul>";
            }
        });

        table.innerHTML = tableHtml;
    }
}

document.querySelector("table tbody").addEventListener('click', function (event) {
    if (event.target.className === 'master') {
        event.target.parentElement.classList.toggle("active");
        var content = event.target.parentElement.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    }
});