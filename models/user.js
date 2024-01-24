const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const participantSchema = new Schema({   
  username: {
    type: String,
    required: true,
    unique: true 
  },
  
  Etudiant1: {
    type: String,
    required: true
  },
  Etudiant2: {
    type: String,
    required: true
  },
  Etudiant3: {
    type: String,
    required: true
  },
  Email1: {
    type: String,
    required: true,
    unique: true
  },
  Email2: {
    type: String,
    required: true,
    unique: true
  },
  Email3: {
    type: String,
    required: true,
    unique: true
  },
  Telephone1: {
    type: String,
    required: true
  },
  Telephone2: {
    type: String,
    required: true
  },
  Telephone3: {
    type: String,
    required: true
  },
  Matricule1: {
    type: String,
    required: true
  },
  Matricule2: {
    type: String,
    required: true
  },
  Matricule3: {
    type: String,
    required: true
  },
  Promotion1: {
    type: String,
    required: true
  },
  Promotion2: {
    type: String,
    required: true
  },
  Promotion3: {
    type: String,
    required: true
   },
   filiere1: {
    type: String,
    required: true
  },
  filiere2: {
    type: String,
    required: true
  },
  filiere3: {
    type: String,
    required: true
  },
  
  nomProjet: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    required: true
  },
  sous: {
    type: String,
    default: 'Nous certifions sur lh́onneur que les renseignements figurant sur le formulaire sont exactes et nous nous engageons à respecter les règles du concours'
  }
});

participantSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Participant', participantSchema);