const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.NODE_ENV === 'test' ? 3001 : 3000;
let db;
if(process.env.NODE_ENV === 'test') {
    db = new sqlite3.Database(':memory');
}
else {
    db = new sqlite3.Database('db.sqlite');
}

const createTableSql = 'CREATE TABLE IF NOT EXISTS persons (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)';
db.serialize(() => {
    db.run(createTableSql);
});

app.use(bodyParser.json());
app.get('/', (req,res) => {
    db.serialize(() => {
        db.all('SELECT * FROM persons', [], (err, rows) => {
            res.json(rows);
        });
    });
});

app.post('/', (req, res) => {
    const {name, age} = req.body;
    db.serialize( () => {
        const smt = db.prepare('INSERT INTO persons (name, age) VALUES (?,?)');
        smt.run(name,age);
        smt.finalize();
        res.json(req.body);
    });
});

app.put('/:id', (req, res) => {
    const {name, age} = req.body;
    const {id} = req.params;
    db.serialize( () => {
        const smt = db.prepare('UPDATE persons SET name = ?, SET age = ? WHERE id = ?');
        smt.run(name,age,id);
        smt.finalize();
        res.json(req.body);
    });
});

app.delete('/:id', (req, res) => {
    const {id} = req.params;    
    db.serialize( () => {
        const smt = db.prepare('DELETE FROM persons WHERE id = ?');
        smt.run(id);
        smt.finalize();
        res.json(req.body);
    });
});

const server = app.listen(port);
module.exports = {app, server};