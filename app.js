const express=require("express")
const app=express();

const bodyParser=require("body-parser");
const { body, validationResult } = require('express-validator');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
//const sendReq = require('./reqDialogFlow');

const ejs=require("ejs")
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

// Générer un ID de session unique
const uniqueSessionId = uuid.v4();
// Models require
const Participant =require("./models/user");
const Admin = require('./models/admin')
const Membre=require('./models/Participants');
app.use(session({
    secret:'mysecret',
    resave:false,
    saveUninitialized:false
   // c code nous dit que si on a des session qui n'ont jamais etais unitialiser
   //on le enregistré si pas le contraire
   }));
   app.use(passport.initialize());//initialisation de passport
   app.use(passport.session());// ilva gerer nos session
   
//EJS ,unitialiser ejs
// Définir le moteur de vue EJS
app.set("view engine", "ejs");

// Définir le chemin vers le dossier contenant les vues
app.set("views", path.join(__dirname, "views"));
//unitialiser notre dossier public
app.use(express.static("public"));


mongoose.connect('mongodb://127.0.0.1:27017/palasa',{
    //useNewUrlParser: true,
    //useUnifiedTopology: true

}).then(db =>{

    console.log('connnexion MONGO reussi');

}).catch(error=> console.log(error));

// exyention bodyparse

//mongoose.connect("mongodb+srv://palasa:sarrive@cluster0.zrsfhjt.mongodb.net/ITBD?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
//const keyDirectoryPath = path.join(__dirname, 'C:\\Users\\sanga\\Desktop\\it\\chemin');

// Configurer Dialogflow client avec le chemin vers le fichier de clé JSON
const keyDirectoryPath = path.join("chemin")

// Configurer Dialogflow client avec le chemin vers le fichier de clé JSON
const keyFilename = path.join(keyDirectoryPath, 'university-408507-e9040d046a2b.json');
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: keyFilename,
});

const projectId = 'itchallenge-nvxo'; // Remplacez par votre ID de projet
const sessionPath = sessionClient.projectAgentSessionPath(projectId, uniqueSessionId);

app.use(bodyParser.urlencoded({extended:false}));

const methodOverride=require("method-override");
const flash=require("connect-flash");//perm
app.use(flash());

app.use(methodOverride('_method'));
app.use(function(req, res, next){
    res.locals.currentUser = req.user;//tout les informations de l'utilisateur
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/inscription",(req,res)=>{

    res.render("./src/pages/inscription")
});

//INSCRIPTION ETUDIANT
app.post('/inscription', (req, res) => {
    const { username, Etudiant1, Etudiant2, Etudiant3, Email1, Email2, Email3, Telephone1, Telephone2, Telephone3, Matricule1, Matricule2, Matricule3, Promotion1, Promotion2, Promotion3, filiere1, filiere2, filiere3, nomProjet, theme } = req.body;
  // Vérifier que tous les champs requis sont remplis
  if (
    !username ||
    !Etudiant1 ||
    !Etudiant2 ||
    !Etudiant3 ||
    !Email1 ||
    !Email2 ||
    !Email3 ||
    !Telephone1 ||
    !Telephone2 ||
    !Telephone3 ||
    !Matricule1 ||
    !Matricule2 ||
    !Matricule3 ||
    !Promotion1 ||
    !Promotion2 ||
    !Promotion3 ||
    !filiere1 ||
    !filiere2 ||
    !filiere3 ||
    !nomProjet ||
    !theme
  ) {
    req.flash('error', 'Veuillez remplir tous les champs');
    return res.redirect('/inscription');
  }
    // Vérifier les e-mails et les matricules
    if ([Email1, Email2, Email3].some((email, index, self) => self.indexOf(email) !== index)) {
      req.flash('error', 'Un ou plusieurs e-mails sont déjà utilisés par un autre utilisateur');
      return res.redirect('/inscription');
    }
  
    if ([Matricule1, Matricule2, Matricule3].some(matricule => matricule.length < 10)) {
      req.flash('error', 'Les matricules doivent comporter au moins 10 chiffres');
      return res.redirect('/inscription');
    }
  
    // Création d'un nouveau participant
    const participant = new Participant({ username, Etudiant1, Etudiant2, Etudiant3, Email1, Email2, Email3, Telephone1, Telephone2, Telephone3, Matricule1, Matricule2, Matricule3, Promotion1, Promotion2, Promotion3, filiere1, filiere2, filiere3, nomProjet, theme });
  
    // Enregistrer le participant
    participant.save()
      .then(() => {
        req.flash('success', 'Participant enregistré avec succès 😁😁');
        res.redirect('/'); // Rediriger vers une page de succès d'inscription
      })
      .catch((err) => {
        console.error(err);
        req.flash('error', 'Une erreur est survenue lors de l\'inscription');
        res.redirect('/inscription'); // Rediriger vers une page en cas d'échec d'inscription
      });
  });
  
  
//ADMIN PARTI
app.get("/admin",(req,res)=>{
    res.render("admin/index");
});
// Middleware pour connecter l'administrateur avec le mot de passe par défaut
// Implémentation de serializeUser et deserializeUser dans la configuration de Passport
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await Admin.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async function (req, email, password, done) {
  try {
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return done(null, false, req.flash('error', 'Adresse e-mail incorrecte'));
    }

    const isPasswordValid = admin && admin.verifierMotDePasse(password); // Appel de la méthode sans hachage

    if (isPasswordValid) {
      return done(null, admin);
    } else {
      return done(null, false, req.flash('error', 'Mot de passe incorrect'));
    }
  } catch (err) {
    return done(err);
  }
}));



// Utilisation du middleware de Passport dans ta route app.post("/admin/login")
app.post("/admin", passport.authenticate("local", {
  successRedirect: "/admin/homead",
  failureRedirect: "/admin",
  failureFlash: true // Active les messages flash d'erreur
}));

// appel page admin

app.get("/admin/homead",isloggedIn, async (req, res) => {
  try {
    // Récupérer les participants depuis la base de données
    const participants = await Participant.find(); // Supposons que Participant soit ton modèle de données

    // Récupérer le nombre de username depuis la base de données
    const usernameCount = await Participant.distinct('username').countDocuments().exec();

    // Calculer le nombre total d'étudiants
    let totalStudents = 0;
    participants.forEach(participant => {
      totalStudents += [participant.Etudiant1, participant.Etudiant2, participant.Etudiant3].filter(Boolean).length;
    });

    // Créer un objet pour stocker le nombre d'étudiants pour chaque enregistrement
    const studentCounts = {};
    participants.forEach(participant => {
      const count = [participant.Etudiant1, participant.Etudiant2, participant.Etudiant3].filter(Boolean).length;
      studentCounts[participant._id] = count;
    });

    // Rendre les données disponibles dans la vue
    res.render("admin/homead", { participants: participants, usernameCount: usernameCount, studentCounts: studentCounts, totalStudents: totalStudents });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Echec total de votre inscription'); // Rediriger en cas d'erreur
    console.log("Echec total de votre inscription");
  }
});
app.get("/admin/group",isloggedIn, async (req, res) => {
  try {
    // Récupérer les participants depuis la base de données
    const participants = await Participant.find(); // Supposons que Participant soit ton modèle de données

    // Récupérer le nombre de username depuis la base de données
    const usernameCount = await Participant.distinct('username').countDocuments().exec();

    // Calculer le nombre total d'étudiants
  
    // Rendre les données disponibles dans la vue
    res.render("admin/groupe", { participants: participants, usernameCount: usernameCount});
  } catch (error) {
    console.error(error);
    req.flash('error', 'Echec total de votre inscription'); // Rediriger en cas d'erreur
    console.log("Echec total de votre inscription");
  }
});


app.get("/admin/etudiant",isloggedIn, async (req, res) => {
  try {
    // Récupérer les participants depuis la base de données
    const participants = await Participant.find(); // Supposons que Participant soit ton modèle de données

    
    // Récupérer le nombre de username depuis la base de données
    const usernameCount = await Participant.distinct('username').countDocuments().exec();


    res.render("admin/etudiant", { participants: participants, usernameCount: usernameCount });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/erreur"); // Rediriger en cas d'erreur
  }
});

app.get("/admin/search",function(req,res){
  res.render("admin/search");
});

app.post("/admin/group",isloggedIn, (req, res) => {
  const searchUsername = req.body.searchBox; // Garde le nom d'utilisateur tel qu'il est entré
  const isLowerCase = searchUsername === searchUsername.toLowerCase();

  // Choisissez la méthode de recherche en fonction de la casse
  const searchQuery = isLowerCase
    ? { username: { $regex: new RegExp(searchUsername, 'i') } } // Recherche en minuscules
    : { username: { $regex: new RegExp(searchUsername.toUpperCase(), 'i') } }; // Recherche en majuscules

  Participant.find(searchQuery)
    .then(foundParticipants => {
      res.render("admin/search", { participants: foundParticipants, searchTerm: searchUsername });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Une erreur est survenue lors de la recherche');
    });
});


app.post("/admin/etudiant",isloggedIn, (req, res) => {
  const searchUsername = req.body.searchBox; // Garde le nom d'utilisateur tel qu'il est entré
  const isLowerCase = searchUsername === searchUsername.toLowerCase();

  // Choisissez la méthode de recherche en fonction de la casse
  const searchQuery = isLowerCase
    ? { username: { $regex: new RegExp(searchUsername, 'i') } } // Recherche en minuscules
    : { username: { $regex: new RegExp(searchUsername.toUpperCase(), 'i') } }; // Recherche en majuscules

  Participant.find(searchQuery)
    .then(foundParticipants => {
      res.render("admin/search", { participants: foundParticipants, searchTerm: searchUsername });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Une erreur est survenue lors de la recherche');
    });
});




app.post("/admin/search",isloggedIn, (req, res) => {
  const searchUsername = req.body.searchBox; // Garde le nom d'utilisateur tel qu'il est entré
  const isLowerCase = searchUsername === searchUsername.toLowerCase();

  // Choisissez la méthode de recherche en fonction de la casse
  const searchQuery = isLowerCase
    ? { username: { $regex: new RegExp(searchUsername, 'i') } } // Recherche en minuscules
    : { username: { $regex: new RegExp(searchUsername.toUpperCase(), 'i') } }; // Recherche en majuscules

  Participant.find(searchQuery)
    .then(foundParticipants => {
      res.render("admin/search", { participants: foundParticipants, searchTerm: searchUsername });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Une erreur est survenue lors de la recherche');
    });
});
app.get("/admin/ajoute",isloggedIn,(req,res)=>{

  res.render("./src/pages/ajoute")
});
//AjoutEZ ETUDIANT
app.post('/admin/ajoute',isloggedIn, (req, res) => {
  const { username, Etudiant1, Etudiant2, Etudiant3, Email1, Email2, Email3, Telephone1, Telephone2, Telephone3, Matricule1, Matricule2, Matricule3, Promotion1, Promotion2, Promotion3, filiere1, filiere2, filiere3, nomProjet, theme } = req.body;
// Vérifier que tous les champs requis sont remplis
if (
  !username ||
  !Etudiant1 ||
  !Etudiant2 ||
  !Etudiant3 ||
  !Email1 ||
  !Email2 ||
  !Email3 ||
  !Telephone1 ||
  !Telephone2 ||
  !Telephone3 ||
  !Matricule1 ||
  !Matricule2 ||
  !Matricule3 ||
  !Promotion1 ||
  !Promotion2 ||
  !Promotion3 ||
  !filiere1 ||
  !filiere2 ||
  !filiere3 ||
  !nomProjet ||
  !theme
) {
  req.flash('error', 'Veuillez remplir tous les champs cher admin');
  return res.redirect('/admin/ajoute');
}
  // Vérifier les e-mails et les matricules
  if ([Email1, Email2, Email3].some((email, index, self) => self.indexOf(email) !== index)) {
    req.flash('error', 'Un ou plusieurs e-mails sont déjà utilisés par un autre utilisateur que vous voulez ajouté cher admin');
    return res.redirect('/admin/ajoute');
  }

  if ([Matricule1, Matricule2, Matricule3].some(matricule => matricule.length < 10)) {
    req.flash('error', 'Les matricules doivent comporter au moins 10 chiffres cher admin');
    return res.redirect('/admin/ajoute');
  }

  // Création d'un nouveau participant
  const membre = new Membre({ username, Etudiant1, Etudiant2, Etudiant3, Email1, Email2, Email3, Telephone1, Telephone2, Telephone3, Matricule1, Matricule2, Matricule3, Promotion1, Promotion2, Promotion3, filiere1, filiere2, filiere3, nomProjet, theme });

  // Enregistrer le participant
  membre.save()
    .then(() => {
      req.flash('success', 'Participants ajoutés avec succès 😁😁');
      res.redirect('/admin/homead'); // Rediriger vers une page de succès d'inscription
    })
    .catch((err) => {
      console.error(err);
      req.flash('error', 'Une erreur est survenue lors de l\'ajout');
      res.redirect('/admin/ajoute'); // Rediriger vers une page en cas d'échec d'inscription
    });
});




app.get("/admin/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);

   req.flash('success', 'vous etes deconnectez...');
   
    res.redirect('/admin');

  
  });
 
});














function isloggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
      req.flash('error','s\'il vous plait veuillez vous inscrire');
      res.redirect("/admin");
  }
}



app.get("/chat",function(req,res){
  res.render("./src/pages/le_bot");
})

app.post('/chat', (req, res) => {
  // Récupérer le texte de l'utilisateur depuis la requête
  let userText = req.body.userText;

  // Valider les données de la requête
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  // Afficher le texte de l'utilisateur dans la console
  console.log(userText);

  // Initialiser la variable fulfillmentText à une chaîne vide
  let fulfillmentText = '';

  // Préparer la requête pour Dialogflow
  const request = {
      session: sessionPath,
      queryInput: {
          text: {
              text: userText,
              languageCode: 'en-US',
          },
      },
  };

  // Envoyer la requête à Dialogflow
  sessionClient.detectIntent(request)
      .then(responses => {
          const result = responses[0].queryResult;
          if (result && result.fulfillmentText) {
              fulfillmentText = result.fulfillmentText;
          }

          // Rendre la réponse de Dialogflow avec les informations récupérées
          res.render('./src/pages/le_bot', {userText, fulfillmentText });
      })
      .catch(err => {
          console.error('ERROR:', err);
          res.status(500).send('Error occurred');
      });
});





//REQUETE SERVEUR
app.listen(3000,()=>{
    console.log("ça passe sur le port 3000");
})