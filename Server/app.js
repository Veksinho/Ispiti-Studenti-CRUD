const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { request, response } = require('express');
dotenv.config();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/:baza', (request, response) => {
    const { baza } = request.params;
    const db = dbService.getDbServiceInstance();
    var results;

    switch (baza) {
        case 'ispit':
            results = db.getAllIspits();
            break;
        case 'student':
            results = db.getAllStudents();
            break;
        case 'predmet':
            results = db.getAllPredmets();
            break;
        case 'polaganje':
            results = db.getAllPolaganjas();
            break;
        default:
            break;
    }

    results
        .then(data => response.json({ data: data }))
        .catch(error => console.log(error));
})

app.post('/insert/:baza', (request, response) => {
    const { baza } = request.params;
    const db = dbService.getDbServiceInstance();
    var result;

    switch (baza) {
        case 'ispit':
            const { bi, predmet_id, ocena } = request.body;
            result = db.insertNewIspit(bi, predmet_id, ocena);
            break;
        case 'student':
            const { broj_indeksa, ime_prezime, studijski_program } = request.body;
            result = db.insertNewStudent(broj_indeksa, ime_prezime, studijski_program);
            break;
        default:
            break;
    }

    result
        .then(data => response.json({ data: data }))
        .catch(error => console.log(error));
})

app.patch('/update/:baza', (request, response) => {
    const { baza } = request.params;
    const db = dbService.getDbServiceInstance();
    var result;

    switch (baza) {
        case 'ispit':
            const { id, bi, predmet_id, ocena } = request.body;
            result = db.updateIspit(id, bi, predmet_id, ocena);
            break;
        case 'student':
            const { stariBrInd, broj_indeksa, ime_prezime, studijski_program } = request.body;
            result = db.updateStudent(stariBrInd, broj_indeksa, ime_prezime, studijski_program);
            break;
        default:
            break;
    }

    result
        .then(data => response.json({ success: data }))
        .catch(error => console.log(error))
});

app.delete('/delete/:baza/:id', (request, response) => {
    const { baza, id } = request.params;
    const db = dbService.getDbServiceInstance();
    var result;

    switch (baza) {
        case 'ispit':
            result = db.deleteIspit(id);
            break;
        case 'student':
            result = db.deleteStudent(id);
            break;
        default:
            break;
    }

    result
        .then(data => response.json({ success: data }))
        .catch(error => console.log(error));
})

app.listen(process.env.PORT, () => console.log('app is running'));