document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5500/ispit')
        .then(response => response.json())
        .then(data => loadHTMLTable(data['data']))
        .catch(error => alert(`Greska pri učitavanju podataka iz baze! \n ${error}`));
    fetch('http://localhost:5500/student')
        .then(response => response.json())
        .then(data => loadHTMLSelect(data['data'], "brInd"))
        .catch(error => alert(`Greska pri učitavanju podataka iz baze! \n ${error}`));
    fetch('http://localhost:5500/predmet')
        .then(response => response.json())
        .then(data => loadHTMLSelect(data['data'], "predmet"))
        .catch(error => alert(`Greska pri učitavanju podataka iz baze! \n ${error}`));
});

// document.addEventListener('DOMContentLoaded', function () {
//     Promise.all([
//         fetch('http://localhost:5500/ispit'),
//         fetch('http://localhost:5500/student'),
//         fetch('http://localhost:5500/predmet')])
//         .then(allResponses => {
//             ispitData = allResponses[0].json().data;
//             studentData = allResponses[1].json().data;
//             predmetData = allResponses[2].json().data;

//             loadHTMLTable(ispitData);
//             loadHTMLSelect(studentData, "brInd");
//             loadHTMLSelect(predmetData, "predmet");
//         })
//         .catch(error => alert(`Greska pri učitavanju podataka iz baze! \n ${error}`));
// });

const sacuvajBtn = document.querySelector('#add-ispit-btn');

sacuvajBtn.onclick = function () {
    const brIndInput = document.querySelector('#brInd-input');
    const brInd = brIndInput.value;
    brIndInput.value = "";

    const predmetInput = document.querySelector('#predmet-input');
    const predmet = predmetInput.value;

    const ocenaInput = document.querySelector('#ocena-input');
    if (ocenaInput.value != "") {
        var ocena = ocenaInput.value;
    } else {
        alert("Niste uneli ocenu!");
        return;
    }

    fetch('http://localhost:5500/insert/ispit', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            bi: brInd,
            predmet_id: predmet,
            ocena: ocena
        })
    })
        .then(response => response.json())
        .then(data => insertRowIntoTable(data['data']))
        .then(() => { ocenaInput.value = "" })
        .catch(error => alert(`Greška pri čuvanju ispita u bazu! \n ${error}`));
}

function insertRowIntoTable(data) {
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');

    let tableHtml = `<tr id="row-${data.ispit_id}">`;

    for (var key in data) {
        if (key === 'ispit_id') continue;
        else {
            tableHtml += `<td>${data[key]}</td>`;
        }
    }

    tableHtml += `<td><button class="row-btn" id="edit" data-id=${data.ispit_id}>Izmeni</td>`;
    tableHtml += `<td><button class="row-btn" id="delete" data-id=${data.ispit_id}>Obriši</td>`;

    tableHtml += "</tr>";

    if (isTableData) {
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.outerHTML = tableHtml;
    }
}

function loadHTMLSelect(data, input) {
    const select = document.querySelector(`#${input}-input`);
    let selectHTML = "";

    if (input === "predmet") {
        data.forEach(function ({ predmet_id, naziv }) {
            selectHTML += `<option value=${predmet_id}>${naziv}</option>`;
        });
    } else {
        data.forEach(function ({ broj_indeksa, ime_prezime }) {
            selectHTML += `<option value=${broj_indeksa}>${ime_prezime}</option>`;
        })
    }

    select.innerHTML = selectHTML;
}

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');
    let tableHtml = "";

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>Nema Podataka</td></tr>";
    } else {

        data.forEach(function ({ ispit_id, bi, naziv, ocena }) {
            tableHtml += `<tr id="row-${ispit_id}">`;
            tableHtml += `<td>${bi}</td>`;
            tableHtml += `<td>${naziv}</td>`;
            tableHtml += `<td>${ocena}</td>`;
            tableHtml += `<td><button class="row-btn" id="edit" data-id=${ispit_id}>Izmeni</td>`;
            tableHtml += `<td><button class="row-btn" id="delete" data-id=${ispit_id}>Obriši</td>`;
            tableHtml += "</tr>";
        });

        table.innerHTML = tableHtml;
    }
}

document.querySelector('table tbody').addEventListener('click', function (event) {
    if (event.target.id === 'edit' && event.target.textContent === "Izmeni") {
        editRow(event.target.dataset.id);
    }
    else if (event.target.id === 'edit' && event.target.textContent === "Sačuvaj") {
        saveEditedRow(event.target.dataset.id);
    }
    else if (event.target.id === 'delete') {
        if (confirm("Da li ste sigurni da želite da obrišete ovaj ispit?") == true)
            deleteRow(event.target.dataset.id);
    }
});

function saveEditedRow(id) {
    const row = document.querySelector(`#row-${id}`);

    const bi = row.childNodes[0].childNodes[0].value;
    const predmet_id = row.childNodes[1].childNodes[0].value;
    if (row.childNodes[2].childNodes.length > 0) {
        var ocena = row.childNodes[2].childNodes[0].data;
    } else {
        alert("Polje ocena ne sme ostati prazno!");
        return;
    }

    fetch('http://localhost:5500/update/ispit', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({
            id,
            bi,
            predmet_id,
            ocena
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                location.reload();
            }
        });
}

function editRow(id) {
    const row = document.querySelector(`#row-${id}`);

    for (i = 0; i < 4; i++) {
        row.childNodes[i].contentEditable = true;
    }

    const studentCb = document.querySelector('#brInd-input');
    let index;
    Array.from(studentCb.options).forEach((student) => {
        if (student.value === row.childNodes[0].childNodes[0].data) {
            index = student.index;
        }
    })
    row.childNodes[0].innerHTML = studentCb.outerHTML;
    row.childNodes[0].childNodes[0].selectedIndex = index;

    const predmetCb = document.querySelector('#predmet-input');
    Array.from(predmetCb.options).forEach((predmet) => {
        if (predmet.textContent === row.childNodes[1].childNodes[0].data) {
            index = predmet.index;
        }
    })
    row.childNodes[1].innerHTML = predmetCb.outerHTML;
    row.childNodes[1].childNodes[0].selectedIndex = index;

    const editButton = row.childNodes[3].childNodes[0];
    editButton.textContent = "Sačuvaj";
}

function deleteRow(id) {
    fetch('http://localhost:5500/delete/ispit/' + id, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
}