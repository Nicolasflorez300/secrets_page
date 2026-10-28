import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt"
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv"
import GoogleStrategy from "passport-google-oauth2"

const app = express();
const port = 3000;
const saltRounds = 10;
env.config()


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 *60 * 60 * 24 
  }
})
)

app.use(passport.initialize())
app.use(passport.session())


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
})

db.connect()



app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => { 
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secrets", (req, res)=>{
  if(req.isAuthenticated()){
    res.render("secrets.ejs")
  }else {
    res.redirect("/login")
  }
})

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}))

app.get("/auth/google/secrets", passport.authenticate("google",{
  successRedirect: "/secrets",
  failureRedirect: "/login"
}))

app.get("/logout",(req, res)=>{
  req.logout((err)=>{
    if(err)console.log(err)
      res.redirect("/")
  })
})






app.post("/register", async (req, res) => {
  const email = req.body.username?.trim()
  const password = req.body.password

  try {
    const valid = await db.query("SELECT email FROM users WHERE email = $1",
      [email]
    )
    if(!email || !password || password.trim().length === 0){
      return res.send(`
      <script>
        window.alert("Please fill all the fields to proceed");
        window.location.href = "/register";
      </script>
      `)
    } else if(valid.rows.length > 0){
      return res.send(`
      <script>
        window.alert("Please try again, the email already exists");
        window.location.href = "/register";
      </script>
      `)
    } else{
      //password hashing
      bcrypt.hash(password, saltRounds, async function(err, hash){
        if(err){
          console.log("Error hashing password: ", err)
        }else {
          const result = await db.query("INSERT INTO users(email, password) VALUES($1, $2) RETURNING * ",
          [email, hash])

          const user = result.rows[0]
          req.login(user, (err)=>{
            console.log(err)
            res.redirect("/secrets")
          })
        }
      })

      
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send("Something went wrong");
  }

});

app.post("/login", passport.authenticate("local",{
  successRedirect: "/secrets",
  failureRedirect: "/login"
}));

passport.use("local",new Strategy(async function verify(username, password, cb){
  try {
    const result = await db.query("SELECT email, password FROM users WHERE email = $1",
    [username]
    )
    const user = result.rows[0]

    if (!user) {
      return cb(null, false);
    }
    const storePassword = user.password;

    bcrypt.compare(password, storePassword, function(err, result) {
      if(err){
        return cb(err)
      } else {
        if(result){
          return cb(null, user)
        }else {
          return cb(null, false)
        }
      }
    });
  } catch (error) {
    return cb(error)
  }
}))

passport.use("google", 
  new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accesToken, refreshToken, profile, cb)=>{
  console.log(profile)

  try {
    const result = await db.query("SELECT * from users WHERE email=$1",
      [profile.email]
    )

    if(result.rows.length === 0){
      const newUser = await db.query("INSERT INTO users(email, password) VALUES($1, $2) RETURNING *",
        [profile.email, "google"]
      )
      cb(null, newUser.rows[0])
    }else {
      //already existing user
      cb(null, result.rows[0])
    }
  } catch (error) {
    cb(error)
  }
}))


passport.serializeUser((user, cb)=>{
  cb(null, user)
})

passport.deserializeUser((user, cb)=>{
  cb(null, user)
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
