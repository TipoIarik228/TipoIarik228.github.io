const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Подключение к базе данных
const db = new sqlite3.Database('./zeusgame.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных', err);
    } else {
        console.log('Подключено к базе данных SQLite');
    }
});

// Создаем таблицу для пользователей
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        coin_count INTEGER DEFAULT 0,
        invited_count INTEGER DEFAULT 0
    )
`);

// Маршрут для получения данных пользователя
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) {
            return res.status(500).send("Ошибка при получении данных пользователя");
        }
        if (row) {
            res.json(row);
        } else {
            // Если пользователь не существует, создаем его
            db.run(`INSERT INTO users (id) VALUES (?)`, [userId], function (err) {
                if (err) {
                    return res.status(500).send("Ошибка при создании пользователя");
                }
                res.json({ id: userId, coin_count: 0, invited_count: 0 });
            });
        }
    });
});

// Маршрут для обновления монет
app.post('/user/:id/add-coins', express.json(), (req, res) => {
    const userId = req.params.id;
    const coins = req.body.coins || 0;

    db.run(`UPDATE users SET coin_count = coin_count + ? WHERE id = ?`, [coins, userId], function (err) {
        if (err) {
            return res.status(500).send("Ошибка при обновлении монет");
        }
        res.send("Монеты успешно добавлены");
    });
});

// Маршрут для обновления количества приглашений
app.post('/user/:id/add-invited', (req, res) => {
    const userId = req.params.id;

    db.run(`UPDATE users SET invited_count = invited_count + 1 WHERE id = ?`, [userId], function (err) {
        if (err) {
            return res.status(500).send("Ошибка при обновлении количества приглашений");
        }
        res.send("Приглашение успешно засчитано");
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
