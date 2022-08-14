const mysql = require('mysql');
const dotenv = require('dotenv');
const { json } = require('express');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
})

connection.connect((error) => {
    if (error) {
        console.log(error.message);
    }

    console.log('db ' + connection.state);
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllIspits() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT i.ispit_id, i.bi, i.predmet_id, p.naziv, i.ocena FROM Ispit i JOIN predmet p ON i.predmet_id = p.predmet_id;";

                connection.query(query, (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results);
                })
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getAllStudents() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM Student;";

                connection.query(query, (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results);
                })
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getAllPredmets() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM Predmet;";

                connection.query(query, (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results);
                })
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getAllPolaganjas() {
        try {
            let studenti = await this.getAllStudents();

            for (let std of studenti) {
                let ispiti = await this.getStudentsIspits(std.broj_indeksa);
                std.ispiti = ispiti;
            }

            return studenti;
        } catch (error) {
            console.log(error);
        }
    }

    async getStudentsIspits(bi) {
        try {
            bi = parseInt(bi, 10);

            const ispiti = await new Promise((resolve, reject) => {
                const query = "SELECT p.predmet_id, p.naziv, i.ocena FROM Ispit i JOIN predmet p ON i.predmet_id = p.predmet_id WHERE i.bi = ?";

                connection.query(query, [bi], (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results);
                })
            });

            return ispiti;
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewIspit(bi, predmet_id, ocena) {
        try {
            bi = parseInt(bi, 10);
            predmet_id = parseInt(predmet_id, 10);
            ocena = parseInt(ocena, 10);

            const ispiti = await this.getStudentsIspits(bi);
            ispiti.forEach(ispit => {
                if (ispit.predmet_id === predmet_id) {
                    return Promise.reject(new Error("Student je već polagao ovaj ispit!"));
                }
            })

            const ispit_id = await new Promise((resolve, reject) => {
                const query = "INSERT INTO Ispit (bi, predmet_id, ocena) VALUES (?, ?, ?);";

                connection.query(query, [bi, predmet_id, ocena], (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results.insertId);
                })
            });

            const nazivPredmeta = await new Promise((resolve, reject) => {
                const query = "SELECT naziv FROM Predmet WHERE predmet_id = ?;";

                connection.query(query, [predmet_id], (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results[0].naziv);
                })
            });

            return {
                ispit_id: insertId,
                bi,
                naziv: nazivPredmeta,
                ocena
            };
            // return Promise.all([ispit_id, bi, nazivPredmeta, ocena]);
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewStudent(broj_indeksa, ime_prezime, studijski_program) {
        try {
            broj_indeksa = parseInt(broj_indeksa, 10);

            const response = await new Promise((resolve, reject) => {
                const query = "INSERT INTO Student (broj_indeksa, ime_prezime, studijski_program) VALUES (?, ?, ?);";

                connection.query(query, [broj_indeksa, ime_prezime, studijski_program], (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve({
                        broj_indeksa,
                        ime_prezime,
                        studijski_program
                    });
                })
            });

            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateIspit(id, bi, predmet_id, ocena) {
        try {
            id = parseInt(id, 10);
            bi = parseInt(bi, 10);
            predmet_id = parseInt(predmet_id, 10);
            ocena = parseInt(ocena, 10);

            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE Ispit SET  bi= ?, predmet_id = ?, ocena = ? WHERE ispit_id = ?";

                connection.query(query, [bi, predmet_id, ocena, id], (error, result) => {
                    if (error) reject(new Error(error.message));
                    resolve(result.affectedRows);
                })
            });

            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateStudent(stariBrInd, broj_indeksa, ime_prezime, studijski_program) {
        try {
            stariBrInd = parseInt(stariBrInd, 10);
            broj_indeksa = parseInt(broj_indeksa, 10);

            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE Student SET  broj_indeksa= ?, ime_prezime = ?, studijski_program = ? WHERE broj_indeksa = ?";

                connection.query(query, [broj_indeksa, ime_prezime, studijski_program, stariBrInd], (error, result) => {
                    if (error) reject(new Error(error.message));
                    resolve(result.affectedRows);
                })
            });

            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async deleteIspit(id) {
        try {
            id = parseInt(id, 10);
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM Ispit WHERE ispit_id = ?";

                connection.query(query, [id], (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results.affectedRows);
                })
            });

            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async deleteStudent(id) {
        try {
            id = parseInt(id, 10);
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM Student WHERE broj_indeksa = ?";

                connection.query(query, [id], (error, results) => {
                    if (error) reject(new Error(error.message));
                    resolve(results.affectedRows);
                })
            });

            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = DbService;