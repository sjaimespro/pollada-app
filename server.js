const express = require("express");
const fileUpload = require("express-fileupload");
const XLSX = require("xlsx");

const app = express();
app.use(express.static("public"));
app.use(fileUpload());
app.use(express.json());

let data = [];
let entregados = {};

function loadExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);

  data = json
    .filter(r => r.nombres && r.nombres !== "total")
    .map((r, i) => ({
      id: i,
      nombre: r.nombres,
      cantidad: r.cantidad,
      lugar: r["lugar de entrega"],
      hora: r.hora,
    }));
}

app.post("/upload", (req, res) => {
  const file = req.files.file;
  const path = "./data.xlsx";
  file.mv(path, err => {
    if (err) return res.status(500).send(err);
    loadExcel(path);
    res.send("Excel cargado ✅");
  });
});

app.get("/data", (req, res) => {
  const result = data.map(d => ({
    ...d,
    entregado: entregados[d.id] || false,
  }));
  res.json(result);
});

app.post("/entregado/:id", (req, res) => {
  entregados[req.params.id] = true;
  res.send("OK");
});

app.post("/reset", (req, res) => {
  entregados = {};
  res.send("Reset ✅");
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
app.post("/update", (req, res) => {
  data = req.body;
  res.send("Actualizado ✅");
});
