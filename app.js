const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')

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



// Register
app.post('/register',function(req,res){

  let username = req.body.username
  let password = req.body.password

  if(req.session) {
    req.session.username = username

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
    } else {
      users.push(user)
    }
}

  console.log(users)
  // res.redirect('/trips')
})

// Sign Up error render

app.get('/signUpError', function(req, res) {
  res.render('signUpError')
})

//Login
app.post('/login',function(req,res){

  let username = req.body.username
  let password = req.body.password

  currentUser = users.find(checkUsername)

  function checkUsername(user) {
    if(user.username == username && user.password == password) {
    return user.username
  } else {
    res.redirect('/loginError')
  }}

  console.log(currentUser)

  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = hour
  res.redirect('/trips')
})

//Log in Error render //

app.get('/loginError', function(req, res) {
  res.render('loginerror')
})

// Log Out //
app.post('/logOut', function(req, res){
  req.session.destroy()
  currentUser = {}

  res.redirect('/')
})


// Render trips page with trips.mustache //
app.get('/trips',function(req,res){
  res.render('trips',{tripList : currentUser.trips})
})

// create a poste route for /trips //
// trips = []
app.post('/trips',function(req,res){

  let city = req.body.city
  let image = req.body.image
  let departureDate = req.body.departureDate
  let returnDate = req.body.returnDate
  let tripId = guid()

  let trip = new Trip(city, image, departureDate, returnDate, tripId)

      currentUser.trips.push(trip)

console.log(currentUser)
//renders the page in trips.mustache  with the array "trips"//
res.render('trips', {tripList : currentUser.trips})

})

//delete a trip //
app.post('/deleteTrip',function(req,res){

  let tripId = req.body.tripId

  currentUser.trips = currentUser.trips.filter(function(trip){
    return trip.tripId != tripId
  })

console.log(tripId)
console.log(currentUser.trips)
res.redirect('/trips')
})

// get the guid or random tripID //
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

app.listen(3000, () => console.log('Break on through!'))
