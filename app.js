const app = require('express')()
const express = require('express')
const mustacheExpress = require('mustache-express')
var http = require('http').Server(app);
var io = require('socket.io')(http)

var session = require('express-session')

let currentUser = {}
let users = []

//import from trip.js and user.js
const Trip = require('./public/trip')
const User = require('./public/user')

// setting up the middleware to use the session //
app.use(session({
  secret: "cat",  //random secret hash
  resave: false,
  saveUninitialized: false
}))

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Needed to run mustache //
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

// converts the 'public' directory to static so i can use all over//
app.use(express.static('public'))

//opens the login page
app.get('/',function(req,res){
  res.render('login')
})



// REGISTER //
app.post('/register',function(req,res){

  let username = req.body.username
  let password = req.body.password

  let user = new User(username,password)
  // console.log(users.includes(user.username))
  var foundUser = false

  users.forEach(function(user) {
    if(username == user.username) {
      foundUser = true
    }
  })
  if(foundUser) {
    res.redirect('/signUpError')
    return {}
  } else {
    users.push(user)
  }

  res.redirect('/')
  console.log(users)
  return {}

})

// SIGN UP ERROR RENDER //

app.get('/signUpError', function(req, res) {
  res.render('signUpError')
})

// LOGIN //
app.post('/login',function(req,res){

  let username = req.body.username
  let password = req.body.password

  var loginSuccess = false

  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = hour

  if(req.session) {
    req.session.username = username


  currentUser = users.find(checkUsername)

  function checkUsername(user) {
    if(user.username == username && user.password == password) {
    loginSuccess = true
    return user.username
  }
  }}

  if(loginSuccess) {
    res.redirect('/trips')
  } else {
    res.redirect('/loginerror')
  }


})

// LOG IN ERROR RENDER //

app.get('/loginError', function(req, res) {
  res.render('loginerror')
})

// LOG OUT //
app.post('/logOut', function(req, res){
  req.session.destroy()
  currentUser = {}

  res.redirect('/')
})


// RENDER /TRIPS PAGE //
app.get('/trips',function(req,res){
  res.render('trips',{tripList : currentUser.trips})
})

// CREATE A POST ROUTE TO /TRIPS //
// trips = []
app.post('/trips',function(req,res){

  let city = req.body.city
  let image = req.body.image
  let departureDate = req.body.departureDate
  let returnDate = req.body.returnDate
  let tripId = guid()

  let trip = new Trip(city, image, departureDate, returnDate, tripId)
      currentUser.trips.push(trip)

  res.render('trips', {tripList : currentUser.trips})

})

// DELETE A TRIP //
app.post('/deleteTrip',function(req,res){

  let tripId = req.body.tripId

  currentUser.trips = currentUser.trips.filter(function(trip){
    return trip.tripId != tripId
  })

res.redirect('/trips')
})

// GET THE GUID OR RANDOME TRIP ID //
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// CHAT FUNCTIONS //
// io.on('connection',function(socket){
//   console.log('USER IS CONNECTED!!!')
//
//   // creating a channel called chat
//   socket.on('chat',function(message){
//     console.log(message)
//     // send back the server response to the user
//     io.emit('chat',message)
//   })
// })
//
// app.get('/chat', function(req, res){
//   res.sendFile(__dirname + '/chat.html')
// });

app.listen(3000, () => console.log('Break on through!'))
