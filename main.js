const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const config = require("./config.json");
const app = express();

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: '98DAY97DG327GAYGD7628G',
    resave: false,
    saveUninitialized: true,
}));

mongoose
    .connect(`mongodb+srv://${config.mongoose.user}:${config.mongoose.password}@cluster0.oeflony.mongodb.net/`)
    .then(() => { console.log("[Onny] Conexão com o banco de dados realizada com sucesso!") })
    .catch((error) => { console.error("Erro ao conectar ao MongoDB:", error) });

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === config.admin.secret.login && password === config.admin.secret.password) {
        req.session.loggedInUser = { username, ip: req.ip }; // Armazena o nome de usuário e o IP na sessão
        return res.redirect('/admin');
    } else {
        return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
});

const requireLogin = (req, res, next) => {
    if (req.session.loggedInUser && req.session.loggedInUser.username === config.admin.secret.login && req.session.loggedInUser.ip === req.ip) {
        return next();
    } else {
        return res.redirect('/');
    }
};

app.get('/logout', (req, res) => {
    // Destruir a sessão para fazer logout
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            return res.status(500).json({ error: 'Erro ao fazer logout.' });
        }
        res.redirect('/');
    });
});

// Modify the existing server-side code or add this to your Express app
app.post('/postagens/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        // Retrieve posts based on categoryId (modify this logic based on your database structure)
        const posts = await PostModel.find({ categoryId: categoryId });

        res.json({ message: 'Filtered Posts', posts: posts });
    } catch (error) {
        console.error('Error fetching filtered posts:', error);
        res.status(500).json({ error: 'Error fetching filtered posts.' });
    }
});

app.get('/postagens/:categoryId', async (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});


app.get('/check/admin', (req, res) => {
    // Verificar se o usuário está logado e se é um admin
    if (req.session.loggedInUser && req.session.loggedInUser.username === config.admin.secret.login) {
        res.sendStatus(200);
    } else {
        res.status(401).json({ error: 'UNAUTHORIZED' });
    }
});

app.get("/postagens", async (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/public/categories.html");
});

app.get("/block", async (req, res) => {
    res.sendFile(__dirname + "/public/block.html");
});

app.get("/admin", requireLogin, async (req, res) => {
    res.sendFile(__dirname + "/public/admin.html");
});

const postSchema = new mongoose.Schema({
    postId: { type: String },
    visible: { type: String, default: "true" },
    date: { type: String },
    title: { type: String },
    description: { type: String },
    attachments: { type: Array, default: [] },
    categories: { type: Array, default: ["NOT_INFORMED"] },
    parentPost: { type: String, default: "" },
    subposts: { type: Array, default: [] }
});
const postModel = mongoose.model('post', postSchema);

const categoriaSchema = new mongoose.Schema({
    categoryId: { type: String },
    categoryName: { type: String },
    categoryUrl: { type: String }
});
const categoriaModel = mongoose.model('categories', categoriaSchema);

app.get('/post', async (req, res) => {
    try {
        const postagens = await postModel.find({});
        res.json(postagens);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar postagens.' });
    }
});

app.get('/category', async (req, res) => {
    try {
        const categorias = await categoriaModel.find({});
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
});

app.get('/category/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const categoryDetails = await categoriaModel.findOne({ categoryId: categoryId });
        res.json(categoryDetails);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar detalhes da categoria.' });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
    },
});

const upload = multer({ storage: storage });
app.post('/post', upload.array('attachments'), async (req, res) => {
    try {
        const { postId, title, description, date, category } = req.body;
        const attachmentPaths = req.files.map(file => file.path);

        const post = await postModel.create({
            postId,
            title,
            description,
            date,
            attachments: attachmentPaths,
            categories: [category]
        });

        res.json({ message: 'Postagem salva!', postId: post._id });
    } catch (error) {
        console.error('Erro ao adicionar a postagem:', error);
        res.status(500).json({ error: 'Erro ao adicionar a postagem.' });
    }
});

app.post('/category', upload.none(), async (req, res) => {
    try {
        const { categoryId, categoryName, categoryUrl } = req.body;

        const categoria = await categoriaModel.create({
            categoryId: categoryId,
            categoryName: categoryName,
            categoryUrl: categoryUrl
        });

        res.json({ message: 'Categoria criada!', categoria: categoria._id });
    } catch (error) {
        console.error('Erro ao criar a categoria:', error);
        res.status(500).json({ error: 'Erro ao criar a categoria.' });
    }
});

app.post('/removeImage', async (req, res) => {
    try {
        const { imagePath } = req.body;
        try {
            await fs.access(imagePath, fs.constants.F_OK);
            await fs.unlink(imagePath);

            const post = await postModel.findOneAndUpdate(
                { attachments: imagePath },
                { $pull: { attachments: imagePath } },
                { new: true }
            );

            console.log('Imagem removida do sistema de arquivos e do banco de dados com sucesso.');
            res.json({ message: 'Imagem removida do sistema de arquivos e do banco de dados com sucesso.' });
        } catch (err) {
            console.warn('O arquivo não foi encontrado. Possivelmente já removido anteriormente.');
            res.status(404).json({ error: 'O arquivo não foi encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao remover a imagem:', error);
        res.status(500).json({ error: 'Erro ao remover a imagem.' });
    }
});

app.get('/edit/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        const postagem = await postModel.findOne({ postId });
        res.json(postagem);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar postagem para edição.' });
    }
});

app.put('/edit/:postId', async (req, res) => {
    const postId = req.params.postId;
    const { date, title, description } = req.body;

    try {
        await postModel.findOneAndUpdate({ postId: postId }, { date: date, title: title, description: description });
        res.json("Postagem editada!");
    } catch (error) {
        res.status(500).json({ error: 'Erro ao editar a postagem.' });
    }
});

app.delete('/delete/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        const post = await postModel.findOne({ postId });
        const attachmentPaths = post.attachments;

        if (attachmentPaths && attachmentPaths.length > 0) {
            await Promise.all(attachmentPaths.map(async (path) => {
                await fs.unlink(path);
            }));
        }

        await postModel.findOneAndDelete({ postId });
        res.json("Postagem excluída!");
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir a postagem.' });
    }
});

app.put('/toggle/:postId', async (req, res) => {
    const postId = req.params.postId;
    const { visible } = req.body;
    try {
        await postModel.findOneAndUpdate({ postId: postId }, { visible: visible });
        res.json("Exibição da postagem alterada!");
    } catch (error) {
        res.status(500).json({ error: 'Erro ao editar a postagem.' });
    }
});

app.put('/edit/category/:categoryId', async (req, res) => {
    const catId = req.params.categoryId;
    const { newName, newUrl } = req.body;

    try {
        const updatedCategory = await categoriaModel.findOneAndUpdate(
            { categoryId: catId },
            { categoryName: newName, categoryUrl: newUrl },
            { new: true }
        );

        if (updatedCategory) {
            res.json("Categoria editada com sucesso!");
        } else {
            res.status(404).json({ error: 'Categoria não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao editar a categoria.' });
    }
});

app.delete('/delete/category/:categoryId', async (req, res) => {
    const catId = req.params.categoryId;

    try {
        const categoria = await categoriaModel.findOne({ catId });
        await categoriaModel.findOneAndDelete({ categoria });
        res.json("Categoria excluída!");
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir a categoria.' });
    }
});

app.get('/selectCategory/:postId', async (req, res) => {
    const { postId } = req.params;
    await selectCategory(postId);
    // Você pode enviar uma resposta de sucesso ou redirecionar para outra página se necessário
    res.status(200).send('Modal aberto com sucesso');
});

// Rota para adicionar/remover postagem da categoria
app.post('/updateCategory/:postId', async (req, res) => {
    const { postId } = req.params;
    const { categoryIds } = req.body;

    try {
        // Atualizar as categorias da postagem
        await postModel.updateOne({ postId }, { categories: categoryIds });
        res.status(200).json({ message: 'Categorias atualizadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar categorias da postagem:', error);
        res.status(500).json({ error: 'Erro ao atualizar categorias da postagem.' });
    }
});

app.listen(8080, () => {
    console.log(`[Onny] Servidor iniciado e dashboard disponível.`);
});