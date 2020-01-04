const path = require('path');
require('dotenv').config({ path: path.join(__dirname, `../${process.platform == 'win32' ? 'dev' : 'prd'}.env`) });
const express = require('express');
const childProcess = require('child_process');
const app = new express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

const config = require('./config');
Object.keys(config).forEach(key => {
    if (typeof config[key] == "String") {
        app.get(key, (req, res) => res.render(config[key], { req }));
    } else if (typeof config[key] == "Object") {
        app.get(key, (req, res) => {
            if (typeof config[key].prerender == "function") {
                config[key].prerender(req);
            }
            if (typeof config[key].render == "function") {
                res.render(config[key].filename || `/${Math.random().toString().substr(3, 5)}`, { req, ...config[key].render() });
            } else {
                res.render(config[key].filename || `/${Math.random().toString().substr(3, 5)}`, { req, ...config[key] });
            }
        })
    }
});

app.post('/github', (req, res) => {
    childProcess.exec(`git pull || pnpm i`);
    res.status(200).json({ error: false });
    childProcess.exec(`pm2 restart wovencoast`);
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Listening to port ${process.env.PORT || 5000}`);
});