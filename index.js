const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
// const fileName = 'file.something';

const Sequelize = require('sequelize');
const sequelize = new Sequelize ('bulletinboard',process.env.POSTGRES_USER,null,{
   host:'localhost',
   dialect:'postgres'
});

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   extended: false
}));

app.set('view engine', 'pug');

const Board = sequelize.define('messages', {
   title: Sequelize.STRING,
   body: Sequelize.TEXT,
   username: Sequelize.STRING
}, {
   timestamps: false
})

// Index route
app.get('/', (req, res) => {
   const execute = (fileName,element)=>{
      res.render(fileName,{
         output: element
      })
   };

   Board.findAll({
      order: sequelize.col('id')
   }).then(res => {
      let table =[];
      res.forEach(x => {
         table = table.concat(x.dataValues);
      });
      return table;
   })
   .then(res => {execute('index',res)}).catch(console.error);
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

   Board.create({
      title:input.title,
      body:input.body,
      username:input.name
   }).then(res.redirect('/'),console.error);

});
// Delete Route
app.get('/deleted', (req,res)=>{
   const rowId = req.query.input;

   Board.destroy({
      where: {
         id: rowId
      }
   }).then(output => res.send({output: output}),console.error);
});

// Edit route
app.get('/edited', (req,res)=>{
   const newContent = req.query.input;
   const rowId = req.query.rowid

   Board.update({
      body: newContent
   },{
      where: {
         id: rowId
      }
   }).then(res.send(),console.error);
});

var server = app.listen(3000, () => {
   console.log(`Server's working just fine on port 3000!`);
});
