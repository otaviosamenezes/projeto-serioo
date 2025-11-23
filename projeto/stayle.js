// referência container e dados
const cardContainer = document.querySelector('.card-container');
let dados = [];

// elementos da busca
const botaoBusca = document.getElementById('botao-busca');
const botaoVoltar = document.getElementById('botao-voltar');
const inputBusca = document.getElementById('input-busca');

// carrega data.json no início
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data.json');
    dados = await res.json();
  } catch (e) {
    console.error('Erro ao carregar data.json:', e);
    dados = [];
  }
  renderizarCards(dados);
});

// normalizar texto
function normalizar(texto) {
  if (!texto) return '';
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}

// busca
botaoBusca.addEventListener('click', () => {
  const termo = normalizar(inputBusca.value);
  if (!dados || dados.length === 0) return;

  if (!termo) {
    renderizarCards(dados);
    botaoVoltar.style.display = 'none';
    return;
  }

  const filtrados = dados.filter(item => 
    normalizar(item.nome).includes(termo) || normalizar(item.descricao).includes(termo)
  );

  renderizarCards(filtrados);
  botaoVoltar.style.display = filtrados.length < dados.length ? 'inline-block' : 'none';
});

// voltar
botaoVoltar.addEventListener('click', () => {
  renderizarCards(dados);
  inputBusca.value = '';
  botaoVoltar.style.display = 'none';
});

// renderiza cards
function renderizarCards(lista) {
  cardContainer.innerHTML = '';
  if (!lista || lista.length === 0){
    cardContainer.innerHTML = "<p style='text-align:center;padding:20px;color:#777'>Nenhum jogo encontrado com esse termo.</p>";
    return;
  }

  for (const item of lista){
    const article = document.createElement('article');
    article.classList.add('card');

    const imgSrc = item.imagem && item.imagem !== 'IMAGEM_AQUI' ? item.imagem : '';
    const imgHTML = imgSrc ? `<img class="card-image" src="${imgSrc}" alt="${escapeHtml(item.nome)}">` :
      `<div style="height:420px;background:linear-gradient(180deg,#111,#0b0b0b);display:flex;align-items:center;justify-content:center;color:#666;border-radius:6px;">IMAGEM_AQUI</div>`;

    const trailerAttr = item.trailer && item.trailer !== 'TRAILER_AQUI' ? item.trailer : '';

    article.innerHTML = `
      ${imgHTML}
      <div class="card-info">
        <h2>${escapeHtml(item.nome)}</h2>
        <p data-full="${escapeHtml(item.descricao)}">${escapeHtml(item.descricao)}</p>

        <div class="card-actions">
          <button class="btn-trailer" ${trailerAttr ? `onclick="abrirTrailer('${trailerAttr}','${escapeHtmlJS(item.nome)}')"`:'disabled'}>▶ Assistir Trailer</button>
          <a class="saiba-mais" href="${item.link && item.link !== 'LINK_AQUI'?item.link:'#'}" target="_blank">Saiba mais</a>
        </div>
      </div>
    `;
    cardContainer.appendChild(article);
  }
}

// abrir trailer
function abrirTrailer(trailerUrl, nome){
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  const titulo = document.getElementById('trailer-titulo');

  let src = trailerUrl||'';
  if(src.includes('watch?v=')&&!src.includes('/embed/')) src = src.replace('watch?v=','embed/');
  if(src && !src.includes('?')) src += '?autoplay=1';
  else if(src && !src.includes('autoplay')) src += '&autoplay=1';

  iframe.src = src;
  titulo.textContent = nome||'';
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}

// fechar trailer
function fecharTrailer(){
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  iframe.src='';
  modal.style.display='none';
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

// fechar clicando fora
window.onclick = function(event){
  const modal = document.getElementById('trailer-modal');
  if(event.target===modal) fecharTrailer();
}

// escape html/js
function escapeHtml(text){
  if(!text) return '';
  return text.replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escapeHtmlJS(text){
  if(!text) return '';
  return text.replace(/'/g,"\\'").replace(/"/g,'\\"');
}
