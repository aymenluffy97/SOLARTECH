const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = 3000;

// 1. CONNEXION BDD
mongoose.connect('mongodb://localhost:27017/solarDB')
  .then(() => console.log("Connecté à MongoDB avec succès"))
  .catch(err => console.error("Erreur MongoDB :", err));

// 2. MODÈLES
const PageContent = mongoose.model("PageContent", new mongoose.Schema({
    page: String, section: String, title: String, description: String, imageUrl: String
}));

const Contact = mongoose.model("Contact", new mongoose.Schema({
    nom: String, tel: String, email: String, message: String, dateEnvoi: { type: Date, default: Date.now }
}));

// 3. CONFIGURATION MULTER (Pour les images admin)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// 4. MIDDLEWARES (Indispensables avant les routes)
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'solartech_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));
app.use(expressLayouts);
app.set("layout", "layout"); 

// 5. FONCTION DE PROTECTION
function isAdmin(req, res, next) {
    if (req.session.authenticated) return next();
    res.redirect('/login');
}

// 6. TOUTES LES ROUTES (Doivent être AVANT le listen)

// --- Authentification ---
app.get('/login', (req, res) => {
    res.render('login', { title: 'Connexion Admin', error: null });
});
app.get("/produits", async (req, res) => {
    try {
        const produits = await Produit.find();
        res.render("produits", { title: "Nos Produits", produits });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors du chargement des produits");
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "Admine123") {
        req.session.authenticated = true;
        return res.redirect('/admin');
    }
    res.render('login', { title: 'Connexion Admin', error: 'Identifiants incorrects' });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
const Produit = mongoose.model("Produit", new mongoose.Schema({
    categorie: String, // 'Panneau', 'Onduleur', 'Marque'
    nom: String,
    description: String,
    imageNom: String   // Exemple: 'panneau-sunpower.jpg'
}));

// --- Pages Publiques ---
app.get("/", async (req, res) => {
    const content = await PageContent.findOne({ page: 'index' });
    res.render("index", { title: "Accueil", content: content || {} });
});

app.get("/services", async (req, res) => {
    const solar = await PageContent.findOne({ page: 'services', section: 'solar' });
    const ev = await PageContent.findOne({ page: 'services', section: 'ev' });
    res.render("services", { title: "Services", solar: solar || {}, ev: ev || {} });
});

app.get("/contact", (req, res) => res.render("contact", { title: "Contact", msg: null }));

// --- Espace Admin ---
app.get('/admin', isAdmin, (req, res) => {
    res.render('admin', { title: "Panel Admin" });
});

// 7. LE LANCEMENT DU SERVEUR (TOUJOURS EN DERNIER)
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});