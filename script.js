// ===== Modo claro / escuro =====
const raiz = document.documentElement;
const botaoTema = document.getElementById('botao-tema');

botaoTema.addEventListener('click', () => {
  const novoTema = raiz.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
  raiz.setAttribute('data-tema', novoTema);
  try { localStorage.setItem('tema', novoTema); } catch (e) {}
});

// ===== Menu ☰ no celular =====
const botaoMenu = document.getElementById('botao-menu');
const menuLinks = document.getElementById('menu-links');

function fecharMenu() {
  menuLinks.classList.remove('aberto');
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.textContent = '☰';
}

botaoMenu.addEventListener('click', () => {
  const aberto = menuLinks.classList.toggle('aberto');
  botaoMenu.setAttribute('aria-expanded', String(aberto));
  botaoMenu.textContent = aberto ? '✕' : '☰';
});

// Fecha o menu ao escolher uma seção ou clicar fora
menuLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', fecharMenu));
document.addEventListener('click', (e) => {
  if (!menuLinks.contains(e.target) && !botaoMenu.contains(e.target)) fecharMenu();
});

// ===== Sombra no menu ao rolar =====
const menu = document.querySelector('.menu');
window.addEventListener('scroll', () => {
  menu.classList.toggle('rolado', window.scrollY > 10);
}, { passive: true });

// ===== Destaca no menu a seção atual =====
const linksMenu = menuLinks.querySelectorAll('a');
const observadorSecoes = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      linksMenu.forEach((link) => {
        link.classList.toggle('ativo', link.getAttribute('href') === '#' + entrada.target.id);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach((secao) => observadorSecoes.observe(secao));

// ===== Animação leve ao rolar =====
const observadorRevelar = new IntersectionObserver((entradas, obs) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visivel');
      obs.unobserve(entrada.target);
    }
  });
}, { threshold: 0.12 });

const elementosRevelar = document.querySelectorAll('.revelar');
elementosRevelar.forEach((el, i) => {
  // pequeno atraso em cascata entre elementos vizinhos
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  observadorRevelar.observe(el);
});

// Garante que o que já está na tela apareça mesmo se o observador atrasar
function revelarVisiveis() {
  elementosRevelar.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('visivel');
  });
}
revelarVisiveis();
window.addEventListener('scroll', revelarVisiveis, { passive: true });

// ===== Copiar e-mail =====
const botaoCopiar = document.getElementById('botao-copiar');
const aviso = document.getElementById('aviso');
let temporizadorAviso;

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add('visivel');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('visivel'), 2000);
}

function copiarAlternativo(texto) {
  const campo = document.createElement('textarea');
  campo.value = texto;
  campo.style.position = 'fixed';
  campo.style.opacity = '0';
  document.body.appendChild(campo);
  campo.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  campo.remove();
  return ok;
}

botaoCopiar.addEventListener('click', async () => {
  const email = botaoCopiar.dataset.email;
  let copiado = false;
  try {
    await navigator.clipboard.writeText(email);
    copiado = true;
  } catch (e) {
    copiado = copiarAlternativo(email);
  }
  mostrarAviso(copiado ? 'copiado!' : 'Não foi possível copiar');
});

// ===== Galeria de fotos aéreas =====
const galeria = document.getElementById('galeria');
const ampliada = document.getElementById('ampliada');
const ampliadaImg = document.getElementById('ampliada-img');
const ampliadaContador = document.getElementById('ampliada-contador');
let fotoAtual = 0;

function fotosDaGaleria() {
  return [...galeria.querySelectorAll('img')];
}

// Remove as fotos que não existem; se não sobrar nenhuma, esconde a galeria
function removerFotoQuebrada(img) {
  img.closest('.galeria__item').remove();
  if (!fotosDaGaleria().length) galeria.remove();
}
fotosDaGaleria().forEach((img) => {
  if (img.complete && img.naturalWidth === 0) removerFotoQuebrada(img);
  else img.addEventListener('error', () => removerFotoQuebrada(img));
});

function mostrarFoto(indice) {
  const fotos = fotosDaGaleria();
  fotoAtual = (indice + fotos.length) % fotos.length;
  ampliadaImg.src = fotos[fotoAtual].src;
  ampliadaImg.alt = fotos[fotoAtual].alt;
  ampliadaContador.textContent = (fotoAtual + 1) + ' / ' + fotos.length;
  ampliada.classList.toggle('ampliada--uma', fotos.length < 2);
}

function abrirFoto(indice) {
  mostrarFoto(indice);
  ampliada.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('ampliada-fechar').focus();
}

function fecharFoto() {
  ampliada.hidden = true;
  document.body.style.overflow = '';
  const fotos = fotosDaGaleria();
  if (fotos[fotoAtual]) fotos[fotoAtual].closest('.galeria__item').focus();
}

galeria.addEventListener('click', (e) => {
  const item = e.target.closest('.galeria__item');
  if (item) abrirFoto([...galeria.children].indexOf(item));
});
document.getElementById('ampliada-fechar').addEventListener('click', fecharFoto);
document.getElementById('ampliada-anterior').addEventListener('click', () => mostrarFoto(fotoAtual - 1));
document.getElementById('ampliada-proxima').addEventListener('click', () => mostrarFoto(fotoAtual + 1));
// Clicar fora da foto fecha
ampliada.addEventListener('click', (e) => { if (e.target === ampliada) fecharFoto(); });

document.addEventListener('keydown', (e) => {
  if (ampliada.hidden) return;
  if (e.key === 'Escape') fecharFoto();
  if (e.key === 'ArrowLeft') mostrarFoto(fotoAtual - 1);
  if (e.key === 'ArrowRight') mostrarFoto(fotoAtual + 1);
});

// Deslizar o dedo no celular troca a foto
let toqueInicioX = null;
ampliada.addEventListener('touchstart', (e) => { toqueInicioX = e.touches[0].clientX; }, { passive: true });
ampliada.addEventListener('touchend', (e) => {
  if (toqueInicioX === null) return;
  const diferenca = e.changedTouches[0].clientX - toqueInicioX;
  if (Math.abs(diferenca) > 50) mostrarFoto(fotoAtual + (diferenca < 0 ? 1 : -1));
  toqueInicioX = null;
});

// ===== Ano no rodapé =====
document.getElementById('ano').textContent = new Date().getFullYear();
