let imagens = [];
let imagensFiltradas = [];
let categoriaAtual = "";
let indiceAtual = 0;
const tamanhoDoLote = 12;
let modoBusca = false;

function formatarNomeImagem(nomeArquivo) {
  const nomeSemExtensao = nomeArquivo
    .split("/")
    .pop()
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  const partes = nomeSemExtensao.split(" ");
  if (partes.length > 3) {
    return partes.slice(0, -1).join(" ");
  }
  return nomeSemExtensao;
}

function formatarNomeCategoria(nome) {
  return nome.replace(/[_-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

async function carregarCategorias() {
  const container = document.querySelector(".filtros-categorias");
  try {
    const response = await fetch("/listar-categorias");
    const categorias = await response.json();

    categorias.forEach(categoria => {
      const btn = document.createElement("button");
      btn.textContent = formatarNomeCategoria(categoria);
      btn.onclick = () => filtrarPorCategoria(categoria);
      container.appendChild(btn);
    });
  } catch (e) {
    console.error("Erro ao carregar categorias:", e);
  }
}

async function filtrarPorCategoria(categoria) {
  const galeria = document.getElementById("galeria");
  categoriaAtual = categoria;
  imagens = [];
  imagensFiltradas = [];
  indiceAtual = 0;
  modoBusca = false;
  galeria.innerHTML = "";

  try {
    const response = await fetch(`/listar/${categoria}`);
    imagens = await response.json();
    carregarMais();
  } catch (e) {
    console.error("Erro ao carregar imagens:", e);
  }
}

function carregarMais() {
  const galeria = document.getElementById("galeria");
  const listaFonte = modoBusca ? imagensFiltradas : imagens;
  const fim = Math.min(indiceAtual + tamanhoDoLote, listaFonte.length);

  for (let i = indiceAtual; i < fim; i++) {
    const urlImagem = listaFonte[i];
    const nomeArquivo = formatarNomeImagem(urlImagem);

    const cloudName = "dw7vcxgy9";
    const caminhoRelativo = urlImagem.split(`/${cloudName}/image/upload/`)[1];
    const thumbBlur = `https://res.cloudinary.com/${cloudName}/image/upload/w_100,q_10,e_blur:200/${caminhoRelativo}`;

    const a = document.createElement("a");
    a.href = `visualizar.html?img=${encodeURIComponent(urlImagem)}`;
    a.target = "_blank";
    a.className = "imagem-item";
    a.innerHTML = `
      <img 
        src="${thumbBlur}" 
        data-src="${urlImagem}" 
        alt="${nomeArquivo}" 
        class="lazy-img"
      >
      <p class="nome-imagem">${nomeArquivo}</p>
    `;
    galeria.appendChild(a);
  }

  aplicarLazyLoading();

  indiceAtual = fim;
  document.getElementById("btnCarregarMais").style.display =
    indiceAtual >= listaFonte.length ? "none" : "block";
}

function aplicarLazyLoading() {
  const imagens = document.querySelectorAll("img.lazy-img");
  imagens.forEach(img => {
    const srcAlta = img.getAttribute("data-src");
    const novaImagem = new Image();
    novaImagem.src = srcAlta;
    novaImagem.onload = () => {
      img.src = srcAlta;
      img.classList.add("loaded");
    };
  });
}

function buscarImagens() {
  const input = document.getElementById("pesquisa").value.toLowerCase().trim();

  if (input === "") {
    modoBusca = false;
    indiceAtual = 0;
    document.getElementById("galeria").innerHTML = "";
    carregarMais();
    return;
  }

  modoBusca = true;
  imagensFiltradas = imagens.filter(url =>
    formatarNomeImagem(url).toLowerCase().includes(input)
  );

  const galeria = document.getElementById("galeria");
  galeria.innerHTML = "";
  indiceAtual = 0;
  carregarMais();
}

window.onload = () => {
  carregarCategorias();
  filtrarPorCategoria("personalizados");
};

document.getElementById("pesquisa").addEventListener("input", buscarImagens);
document.getElementById("btnCarregarMais").addEventListener("click", carregarMais);
