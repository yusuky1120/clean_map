const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// MySQLの接続設定
const db = mysql.createConnection({
  host: 'database-1.c7iagmoaoaxo.us-east-2.rds.amazonaws.com',
  user: 'yusuky', // MySQLユーザー名
  password: '2001Muro1120!', // MySQLのパスワード
  database: 'mydatabase' // データベース名
});

// データベース接続確認
db.connect((err) => {
  if (err) {
    console.error('MySQL接続エラー:', err);
    return;
  }
  console.log('MySQLに接続しました');
});

db.on('error', function(err) {
    console.log('MySQLエラー:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // 接続が失われた場合に再接続
    } else {
      throw err;
    }
  });

// ミドルウェア設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORSの設定（必要な場合）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ゴミ箱を登録するエンドポイント
app.post('/api/add-bin', (req, res) => {
  const { lat, lng, binType } = req.body;

  if (!lat || !lng || !binType) {
    return res.status(400).json({ error: '全てのフィールドを入力してください。' });
  }

  const query = 'INSERT INTO locations (lat, lng, type, bin_type) VALUES (?, ?, ?, ?)';
  db.query(query, [lat, lng, 'bin', binType], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
    res.status(201).json({ message: 'ゴミ箱が登録されました', id: result.insertId });
  });
});

// 喫煙所を登録するエンドポイント
app.post('/api/add-smoking', (req, res) => {
  const { lat, lng, crowd } = req.body;

  if (!lat || !lng || !crowd) {
    return res.status(400).json({ error: '全てのフィールドを入力してください。' });
  }

  const query = 'INSERT INTO locations (lat, lng, type, crowd) VALUES (?, ?, ?, ?)';
  db.query(query, [lat, lng, 'smoking_area', crowd], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
    res.status(201).json({ message: '喫煙所が登録されました', id: result.insertId });
  });
});

// 登録された場所の一覧を取得するエンドポイント
app.get('/api/locations', (req, res) => {
  const query = 'SELECT * FROM locations';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
    res.json(results);
  });
});

// 場所を削除するエンドポイント
app.delete('/api/delete-location/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM locations WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
    res.json({ message: '場所が削除されました' });
  });
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
