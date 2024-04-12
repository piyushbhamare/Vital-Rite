import express from "express";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import { dirname } from  "path";
import path from "path";
import { fileURLToPath } from "url";
import env from "dotenv";

env.config();

const app = express();
const port = process.env.HOST_PORT;
const saltRounds = 10;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure Handlebars
const hbs = exphbs.create({ extname: 'hbs' });
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
  
const db_users = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE_USERS,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
  
const db_doctors = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE_DOCTORS,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const db_prescribe = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE_PRESCRIBE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
  
db_users.connect();
db_doctors.connect();
db_prescribe.connect();

app.get("/" , (req,res) => {
  res.render("User_login.ejs");
});

app.get("/login_user", (req, res) => {
  res.render("User_login.ejs");
});

app.get("/Doctor_login", (req,res) => {
  res.render("Doctor_login.ejs");
});

app.get("/User_login", (req,res) => {
  res.render("User_login.ejs");
});

app.get("/register_user", (req, res) => {
  res.render("register_user1.ejs");
});

app.get("/register_doc", (req, res) => {
  res.render("register_doc1.ejs");
});

app.get("/userbookappointments", (req, res) => {
  res.render("userbookappointments.ejs");
});

app.get("/paitentdetails",(req,res) => {
  res.render("paitentdetails.ejs");
});

app.get("/prescribe",(req,res) => {
  res.render("prescribe.ejs");
});

app.get("/prescribedetail", (req,res) => {
  //res.render('prescribedetail.ejs');
  db_prescribe.query("SELECT * FROM prescribe",function(error,results,fields){
    if(error) throw error;
    res.render("prescribedetail.ejs",{data : results});
  });
});

app.post("/register_user", async(req,res) =>{
  const name = req.body.name;
  const age = req.body.age;
  const gender = req.body.gender;
  const blood_group = req.body.blood_group;
  const allergy = req.body.allergy;
  const operation = req.body.operation;
  const disease = req.body.disease;
  const email = req.body.email;
  const password = req.body.password;

  try{
    const checkResult = await db_users.query("SELECT * FROM users WHERE email = $1",[email]);
    if(checkResult.rows.length>0){
      res.send("User Already Exists!!");
    } else {
      bcrypt.hash(password,saltRounds, async(err,hash) => {
        if(err){
          console.error("Error Hashing Password : ",err);
        } else {
          const result = await db_users.query("INSERT INTO users (name, email, password, age, gender, allergies, bloodgroup, disease, operation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",[name, email, hash, age, gender, allergy, blood_group, disease, operation]);
          res.render("usermainpage.ejs");
        }
      });
    }
  } catch(err) {
    console.log(err);
  }
});

app.post("/register_doc", async(req,res) =>{
  const name = req.body.name;
  const gender = req.body.gender;
  const degree = req.body.degree;
  const speciality = req.body.speciality;
  const qualification_years = req.body.qualification_years;
  const experience = req.body.experience;
  const hospital_name = req.body.hospital_name;
  const hospital_address = req.body.hospital_address;
  const clinic_name = req.body.clinic_name;
  const clinic_address = req.body.clinic_address;
  const email = req.body.email;
  const password = req.body.password;

  try{
    const checkResult = await db_doctors.query("SELECT * FROM doctors WHERE email = $1",[email]);
    if(checkResult.rows.length>0){
      res.send("User Already Exists!!");
    } else {
      bcrypt.hash(password,saltRounds, async(err,hash) => {
        if(err){
          console.error("Error Hashing Password : ",err);
        } else {
          const result = await db_doctors.query("INSERT INTO doctors (name, email, password, gender, degree, qualificationyear, experience, hospitalname, hospitaladdress, clinicname, clinicaddress, speciality ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",[name, email, hash, gender, degree, qualification_years, experience, hospital_name, hospital_address, clinic_name, clinic_address, speciality]);
          res.render("docmainpage.ejs");
        }
      });
    }
  } catch(err) {
    console.log(err);
  }
});

app.post("/login_user", async (req, res) => {
  const email = req.body.email;
  const Loginpassword = req.body.password;

  try {
    const result = await db_users.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const HashedPassword = user.password;

      bcrypt.compare(Loginpassword,HashedPassword,(err,result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {
            res.render("usermainpage.ejs");
          } else {
            res.send("Incorrect Password");
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login_doctor", async (req, res) => {
  const email = req.body.email;
  const Loginpassword = req.body.password;

  try {
    const result = await db_doctors.query("SELECT * FROM doctors WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const HashedPassword = user.password;

      bcrypt.compare(Loginpassword,HashedPassword,(err,result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {
            res.render("docmainpage.ejs");
          } else {
            res.send("Incorrect Password");
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/userbookappointments", async(req,res)=>{
  const doc_name = req.body.search;
  try{
    const result = await db_doctors.query("SELECT * FROM doctors WHERE name = $1",[doc_name]);
    if(result.rows.length>0){
      res.render("userbookappointments.ejs",{data : doc_name});
    } else {
      res.render("userbookappointments.ejs",{error: "No Match Found!!"});
    }
  } catch (err){
    console.error("Error occurred: ",err.message);
    res.render("userbookappointments.ejs",{error: "No Match Found!!"});
  }
});

app.post("/paitentdetails", async(req,res)=>{
  const name = req.body.name;
  const age = req.body.age;
  const gender = req.body.gender;
  try{
    res.render("docmainpage.ejs",{data:name});
  } catch(err){
    console.error("Error occurred: ",err.message);
    res.redirect("userbookappointments.ejs");
  }
});

app.post("/prescribe", async(req,res) => {
  const id = req.body.id;
  const name = req.body.name;
  const med1 = req.body.med1;
  const med2 = req.body.med2;
  const med3 = req.body.med3;
  const diag1 = req.body.diag1;
  const diag2 = req.body.diag2;
  const diag3 = req.body.diag3;
  const time1 = req.body.time1;
  const time2 = req.body.time2;
  const time3 = req.body.time3;
  try{
    const result = await db_prescribe.query("INSERT INTO prescribe (id, name, med1, med2, med3, diag1, diag2, diag3, time1, time2, time3) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",[id, name, med1, med2, med3, diag1, diag2, diag3, time1, time2, time3]); 
    res.render("usermainpage.ejs",{data: id});
    if(result.rows.length>0){
      res.render("prescribedetail.ejs",{data: id});
    }
  } catch(err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

