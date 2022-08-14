document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5500/student')
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

        data.forEach(function ({ broj_indeksa, ime_prezime, studijski_program }) {
            tableHtml += `<tr id="row-${broj_indeksa}">`;
            tableHtml += `<td>${broj_indeksa}</td>`;
            tableHtml += `<td>${ime_prezime}</td>`;
            tableHtml += `<td>${studijski_program}</td>`;
            tableHtml += `<td><button class="row-btn" id="edit" data-id=${broj_indeksa}>Izmeni</td>`;
            tableHtml += `<td><button class="row-btn" id="delete" data-id=${broj_indeksa}>Obriši</td>`;
            tableHtml += "</tr>";
        });

        table.innerHTML = tableHtml;
    }
}

const sacuvajBtn = document.querySelector('#add-student-btn');

sacuvajBtn.onclick = function () {
    const imePrezInput = document.querySelector('#imePrezime-input');
    if (imePrezInput.value != "") {
        var imePrez = imePrezInput.value;
    } else {
        alert("Niste uneli ime i prezime!");
        return;
    }

    const brIndInput = document.querySelector('#brInd-input');
    if (brIndInput.value != "") {
        var brInd = brIndInput.value;
    } else {
        alert("Niste uneli broj indeksa!");
        return;
    }

    const strProgramInput = document.querySelector('#stdProgram-input');
    const strProgram = strProgramInput.value;

    fetch('http://localhost:5500/insert/student', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            broj_indeksa: brInd,
            ime_prezime: imePrez,
            studijski_program: strProgram
        })
    })
        .then(response => response.json())
        .then(data => insertRowIntoTable(data['data']))
        .then(() => {
            brIndInput.value = "";
            imePrezInput.value = "";
        })
        .catch(error => alert(`Greška pri čuvanju studenta u bazu! \n ${error}`));
}

function insertRowIntoTable(data) {
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');

    let tableHtml = `<tr id="row-${data.broj_indeksa}">`;

    for (var key in data) {
        tableHtml += `<td>${data[key]}</td>`;
    }

    tableHtml += `<td><button class="row-btn" id="edit" data-id=${data.broj_indeksa}>Izmeni</td>`;
    tableHtml += `<td><button class="row-btn" id="delete" data-id=${data.broj_indeksa}>Obriši</td>`;

    tableHtml += "</tr>";

    if (isTableData) {
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.outerHTML = tableHtml;
    }
}

document.querySelector('table tbody').addEventListener('click', function (event) {
    if (event.target.id === 'edit' && event.target.textContent === "Izmeni") {
        saveEditedRow = saveEditedRow.bind(this, event.target.dataset.id, editRow(event.target.dataset.id));
    }
    else if (event.target.id === 'edit' && event.target.textContent === "Sačuvaj") {
        saveEditedRow();
    }
    else if (event.target.id === 'delete') {
        if (confirm("Da li ste sigurni da želite da obrišete ovog studenta?") == true)
            deleteRow(event.target.dataset.id);
    }
});

function saveEditedRow(id, stariBrInd) {
    const row = document.querySelector(`#row-${id}`);

    if (row.childNodes[0].childNodes.length > 0) {
        var broj_indeksa = row.childNodes[0].childNodes[0].data;
    } else {
        alert("Broj indeksa ne sme ostati prazan!");
    }

    if (row.childNodes[1].childNodes.length > 0) {
        var ime_prezime = row.childNodes[1].childNodes[0].data;
    } else {
        alert("Ime i prezime ne sme ostati prazno!");
    }
    const studijski_program = row.childNodes[2].childNodes[0].value;

    fetch('http://localhost:5500/update/student', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({
            stariBrInd,
            broj_indeksa,
            ime_prezime,
            studijski_program
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                location.reload();
            }
        })
        .catch(error => alert(`Greška pri čuvanju studenta u bazu! \n ${error}`));
}

function editRow(id) {
    const row = document.querySelector(`#row-${id}`);

    for (i = 0; i < 2; i++) {
        row.childNodes[i].contentEditable = true;
    }

    const cb = document.querySelector('#stdProgram-input');
    const program = row.childNodes[2].childNodes[0].data;
    row.childNodes[2].innerHTML = cb.outerHTML;
    row.childNodes[2].childNodes[0].selectedIndex = program === 'isit' ? 0 : 1;

    const editButton = row.childNodes[3].childNodes[0];
    editButton.textContent = "Sačuvaj";

    return row.childNodes[0].childNodes[0].data;
}

function deleteRow(id) {
    fetch('http://localhost:5500/delete/student/' + id, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        })
        .catch(error => alert(`Greška pri brisanju studenta iz baze! \n ${error}`));
}