const multer = require('multer');
const upload = multer({ dest: 'public/images/' });

// Route pour afficher la page admin
app.get('/admin', (req, res) => {
    res.render('admin');
});

// Route pour traiter les mises à jour
app.post('/admin/update-services', upload.fields([
    { name: 'solar_image', maxCount: 1 },
    { name: 'ev_image', maxCount: 1 }
]), (req, res) => {
    // Ici, vous enregistrez les textes et les noms de fichiers dans une base de données ou un fichier JSON
    console.log(req.body.solar_desc);
    console.log(req.files['solar_image']);
    res.redirect('/admin');
});