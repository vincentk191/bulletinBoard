const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
// const fileName = 'file.something';

const { Client } = require('pg');
const client = new Client ({
   user: process.env.POSTGRES_USER,
   password: process.env.POSTGRES_PASSWORD,
   host:'localhost',
   database: 'bulletinboard'
});

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   extended: false
}));

app.set('view engine', 'pug');

client.connect();

// Index route
app.get('/', (req, res) => {
   const execute = (fileName,element)=>{
      res.render(fileName,{
         output: element
      })
   };

   client.query('select * from messages order by id')
      .then(res => {execute('index',res.rows)},console.error);
});

// Directing to messages page
app.get('/messages', (req, res) => {
   res.render('messages');
});

// Add Post route
app.post('/addPost',(req,res) => {
   const input = {
      title: req.body.title,
      body: req.body.body,
      name: req.body.username
   }

   if(input.name == undefined || input.name == ''){
      input.name = 'Anonymous';
   }

   const array = [input.title,input.body,input.name];

   client.query('select * from messages',(err,rep)=>{
      if (err){
         throw err;
      }
      client.query('insert into messages (title,body,username) values ($1,$2,$3)',array)
         .then(res.redirect('/'),console.error);

   });
});
// Delete Route
app.get('/deleted', (req,res)=>{
   const rowId = req.query.input;

   client.query(`delete from messages where id = ${rowId}`)
      .then(output => res.send({output: output}),console.error);
});

// Edit route
app.get('/edited', (req,res)=>{
   const newContent = req.query.input;
   const rowId = req.query.rowid
   
   client.query(`update messages set body = '${newContent}' where id = ${rowId}`)
      .then(res.send()).catch(console.error);
});

var server = app.listen(3000, () => {
   console.log(`Server's working just fine on port 3000!`);
});
