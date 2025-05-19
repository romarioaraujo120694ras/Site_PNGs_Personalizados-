const express = require("express");
const cors = require("cors");
const { v2: cloudinary } = require("cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Configuração da Cloudinary
cloudinary.config({
  cloud_name: "dw7vcxgy9",
  api_key: "833421445544343",
  api_secret: "vsVCkqFRjFL1IgWbfU3X49ZCQ64"
});

// Lista as categorias (pastas dentro de 'imagens')
app.get("/listar-categorias", async (req, res) => {
  try {
    const result = await cloudinary.api.sub_folders("imagens");
    const categorias = result.folders.map(folder => folder.name);
    res.json(categorias);
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    res.status(500).json({ erro: "Erro ao listar categorias" });
  }
});

// Lista as imagens de uma categoria específica
app.get("/listar/:categoria", async (req, res) => {
  const categoria = req.params.categoria;
  try {
    const result = await cloudinary.search
      .expression(`folder:imagens/${categoria} AND resource_type:image`)
      .sort_by("public_id", "desc")
      .max_results(100)
      .execute();

    const urls = result.resources.map(img => img.secure_url);
    res.json(urls);
  } catch (err) {
    console.error("Erro ao listar imagens da categoria:", err);
    res.status(500).json({ erro: "Erro ao listar imagens da categoria" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
