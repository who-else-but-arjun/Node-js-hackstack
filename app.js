const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 8000;

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('image');

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const products = [];

app.get('/', (req, res) => {
    res.render('index', { products, msg: '' });
});

app.post('/add-product', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('index', { products, msg: err });
        } else {
            if (req.file == undefined) {
                res.render('index', { products, msg: 'Error: No File Selected!' });
            } else {
                const { name, description, price, stock, rating } = req.body;
                if (name && description && price && stock && rating) {
                    products.push({
                        name,
                        description,
                        price,
                        stock,
                        rating,
                        image: `/uploads/${req.file.filename}`
                    });
                    res.redirect('/');
                } else {
                    res.render('index', { products, msg: 'Error: All fields are required!' });
                }
            }
        }
    });
});

app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page Not Found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
