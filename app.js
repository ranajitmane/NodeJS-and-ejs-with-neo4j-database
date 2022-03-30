var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'Ranajit@9450'));

app.get('/',(req, res)=>{
    var studentsArr = [];
    var collegesArr = [];
    var session = driver.session()
    session
    .run('MATCH (n:Student) RETURN n LIMIT 25')
    .then((result)=>{
        result.records.map((item)=>{
            item._fields[0].properties.name !== undefined && studentsArr.push(item._fields[0].properties)
            console.log(item._fields[0].properties)
        });

        session
        .run('MATCH (n:School) RETURN n LIMIT 25')
        .then((result)=>{
            result.records.map((item)=>{
                item._fields[0].properties.name !== undefined && collegesArr.push(item._fields[0].properties)
//                console.log(item._fields[0].properties)
            });
            res.render('index',{
                students: studentsArr,
                colleges: collegesArr
            })
        })
        .catch((error)=>{
            console.log('error', error)
        })
    })
    .catch((error)=>{
        console.log('error', error)
    })
});

app.post('/add-college', (req, res) => {
    var collName = req.body.college_name;
    var session = driver.session()
    session
        .run('CREATE (n:School{name: $name }) RETURN n.name', {name: collName})
        .then((result)=>{
            res.redirect('/');
        })
        .catch((error)=>{
            console.log('error', error)
        })
});

app.get('/delete-college/:college_name', (req, res) => {
    console.log('delete-college', req.params.college_name)
    var collName = req.params.college_name;
    var session = driver.session()
        session
            .run("MATCH (a: School {name: 'DYP'}) DELETE a")
            .then((result)=>{
                res.redirect('/');
            })
            .catch((error)=>{
                console.log('error', error)
            })
});

app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;