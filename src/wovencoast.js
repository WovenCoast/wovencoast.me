const path = require('path');
require('dotenv').config({ path: path.join(__dirname, `../${process.platform == 'win32' ? 'dev' : 'prd'}.env`) });
const express = require('express');
const childProcess = require('child_process');
const app = new express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

const globals = require('./config');
Object.keys(globals.routes).forEach((key) => {
    app.get(key, async (req, res) => {
        if (typeof globals.routes[key] === 'string') {
            res.render(globals.routes[key], { req, favicon: globals.favicon });
        } else {
            var data = globals.routes[key];
            if (typeof globals.routes[key].prerender === "function") {
                data = await globals.routes[key].prerender(req, data);
            }
            res.render(globals.routes[key].file, { data, req, favicon: globals.favicon });
        }
    });
});

app.post('/github', (req, res) => {
    childProcess.exec(`git pull || pnpm i`);
    res.status(200).json({ error: false });
    childProcess.exec(`pm2 restart wovencoast`);
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Listening to port ${process.env.PORT || 5000}`);
});