/*! home-veja-em-uso.js | Faixa "Veja em uso" na HOME da loja (somente "/"). JS puro, sem dependencias.
 *  Colar em Loja virtual > Scripts:  <script src="https://cdn.jsdelivr.net/gh/magnowltda/magnow-assets@v16/home-veja-em-uso.js" defer></script>
 *  Desligar: ATIVO = false (nova tag + trocar o @vNN no snippet) ou tirar o snippet; ?semfaixa=1 desliga so naquela visita (teste).
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- configuracao
  var ATIVO = true; // kill switch
  var BASE = 'https://cdn.jsdelivr.net/gh/magnowltda/magnow-assets@v16/home/veja-em-uso/';
  var CLIPES = [
    { video: BASE + 'uso-1.mp4', poster: BASE + 'uso-1.jpg', legenda: 'Fechando o saco a vácuo' },
    { video: BASE + 'uso-2.mp4', poster: BASE + 'uso-2.jpg', legenda: 'Tirando o ar com a bomba elétrica' },
    { video: BASE + 'uso-3.mp4', poster: BASE + 'uso-3.jpg', legenda: 'Tirando o ar com a bomba manual' }
  ];
  var ANCORA = 'kits prontos'; // titulo do bloco ANTES do qual a faixa entra (comparado sem acento/caixa)
  var ESPERA_MS = 180000; // quanto tempo ficar de olho esperando o tema montar o bloco (as colecoes da home carregam sob demanda, ao rolar); depois desiste sem quebrar nada

  // ---------------------------------------------------------------- guardas
  if (!ATIVO || !CLIPES.length) return;
  if (location.pathname !== '/') return;
  if (/[?&]semfaixa=1(&|$)/.test(location.search)) return;
  if (document.getElementById('vu-faixa')) return;

  var AZUL = '#010066', ROXO = '#3A008A', MAGENTA = '#FF0188';

  function norm(s) {
    return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Conexao/preferencias que pedem so o poster (sem baixar video)
  function modoLeve() {
    try {
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
      var c = navigator.connection || {};
      if (c.saveData === true) return true;
      return /^(slow-2g|2g|3g)$/.test(c.effectiveType || '');
    } catch (e) { return false; }
  }

  // ---------------------------------------------------------------- ancora
  function acharAncora() {
    var hs = document.querySelectorAll('h1,h2,h3,h4,.theme-title,.collection-name');
    for (var i = 0; i < hs.length; i++) {
      if (norm(hs[i].textContent) !== ANCORA) continue;
      var bloco = hs[i].closest('section') || hs[i].closest('[class*="collection"]');
      if (bloco && bloco.parentNode && bloco !== document.body) return { bloco: bloco, titulo: hs[i] };
    }
    return null;
  }

  // ---------------------------------------------------------------- estilo
  function injetarEstilo(fonteTitulo) {
    var css =
      '#vu-faixa{box-sizing:border-box;padding:28px 0 8px;background:#fff;font-family:inherit}' +
      '#vu-faixa *{box-sizing:border-box}' +
      '#vu-faixa .vu-titulo{margin:0 16px 14px;font-family:' + fonteTitulo + ';font-size:26px;line-height:1.15;font-weight:400;color:' + AZUL + '}' +
      '#vu-faixa .vu-titulo::after{content:"";display:block;width:44px;height:4px;border-radius:4px;margin-top:8px;background:linear-gradient(90deg,' + ROXO + ',' + MAGENTA + ')}' +
      '#vu-faixa .vu-lista{display:flex;gap:12px;margin:0;padding:0 16px 10px;list-style:none;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;scroll-padding:0 16px;scrollbar-width:none}' +
      '#vu-faixa .vu-lista::-webkit-scrollbar{display:none}' +
      '#vu-faixa .vu-item{flex:0 0 150px;width:150px;margin:0;scroll-snap-align:start}' +
      '#vu-faixa .vu-card{position:relative;display:block;width:100%;aspect-ratio:9/16;padding:0;border:0;border-radius:14px;overflow:hidden;background:#e9e6f5;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 10px rgba(1,0,102,.14)}' +
      '#vu-faixa .vu-card:focus-visible{outline:3px solid ' + MAGENTA + ';outline-offset:2px}' +
      '#vu-faixa .vu-poster,#vu-faixa .vu-video{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block}' +
      '#vu-faixa .vu-video{opacity:0;transition:opacity .25s ease;pointer-events:none}' +
      '#vu-faixa .vu-card.vu-on .vu-video{opacity:1}' +
      '#vu-faixa .vu-play{position:absolute;right:8px;bottom:8px;width:26px;height:26px;border-radius:50%;background:rgba(1,0,102,.55);opacity:0;transition:opacity .2s;pointer-events:none}' +
      '#vu-faixa .vu-play::after{content:"";position:absolute;left:10px;top:7px;border-left:9px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent}' +
      '#vu-faixa .vu-card.vu-pausado .vu-play{opacity:1}' +
      '#vu-faixa .vu-legenda{margin:8px 2px 0;min-height:2.7em;font-size:13px;line-height:1.35;color:#333}';
    var st = document.createElement('style');
    st.id = 'vu-estilo';
    st.appendChild(document.createTextNode(css));
    document.head.appendChild(st);
  }

  // ---------------------------------------------------------------- DOM
  function montar(leve, fonteTitulo) {
    var sec = document.createElement('section');
    sec.id = 'vu-faixa';
    sec.setAttribute('aria-label', 'Veja em uso');
    var h = document.createElement('h2');
    h.className = 'vu-titulo';
    h.textContent = 'Veja em uso';
    var ul = document.createElement('ul');
    ul.className = 'vu-lista';
    CLIPES.forEach(function (c) {
      var li = document.createElement('li');
      li.className = 'vu-item';
      var card = document.createElement(leve ? 'div' : 'button');
      card.className = 'vu-card';
      if (!leve) {
        card.type = 'button';
        card.setAttribute('aria-label', 'Pausar ou retomar o vídeo: ' + c.legenda);
        card.setAttribute('aria-pressed', 'false');
      }
      var img = document.createElement('img');
      img.className = 'vu-poster';
      img.src = c.poster;
      img.alt = '';
      img.width = 540;
      img.height = 960;
      img.loading = 'lazy';
      img.decoding = 'async';
      card.appendChild(img);
      if (!leve) {
        var v = document.createElement('video');
        v.className = 'vu-video';
        v.muted = true;
        v.defaultMuted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('muted', '');
        v.preload = 'none';
        v.controls = false;
        v.disablePictureInPicture = true;
        v.setAttribute('aria-hidden', 'true');
        v.tabIndex = -1;
        v.setAttribute('data-src', c.video);
        card.appendChild(v);
        var pl = document.createElement('span');
        pl.className = 'vu-play';
        pl.setAttribute('aria-hidden', 'true');
        card.appendChild(pl);
      }
      var cap = document.createElement('figcaption');
      cap.className = 'vu-legenda';
      cap.textContent = c.legenda;
      var fig = document.createElement('figure');
      fig.style.margin = '0';
      fig.appendChild(card);
      fig.appendChild(cap);
      li.appendChild(fig);
      ul.appendChild(li);
    });
    sec.appendChild(h);
    sec.appendChild(ul);
    return sec;
  }

  // ---------------------------------------------------------------- video: toca so na tela, pausa fora, toque pausa/retoma
  function ligarVideos(sec) {
    var cards = sec.querySelectorAll('.vu-card');
    if (!window.IntersectionObserver) return;
    function tocar(card) {
      var v = card.querySelector('video');
      if (!v || card.vuPausadoUsuario || document.hidden) return;
      if (!v.getAttribute('src')) v.src = v.getAttribute('data-src'); // so baixa quando o card entra na tela
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    function parar(card) {
      var v = card.querySelector('video');
      if (v) v.pause();
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var card = en.target;
        card.vuVisivel = en.isIntersecting;
        if (en.isIntersecting) tocar(card); else parar(card);
      });
    }, { threshold: 0.6 });
    [].forEach.call(cards, function (card) {
      var v = card.querySelector('video');
      if (!v) return;
      v.addEventListener('playing', function () { card.classList.add('vu-on'); card.classList.remove('vu-pausado'); });
      v.addEventListener('error', function () { card.classList.remove('vu-on'); }); // falhou: o poster continua
      card.addEventListener('click', function () {
        if (!card.classList.contains('vu-on') && !card.vuPausadoUsuario && v.paused && !v.getAttribute('src')) { tocar(card); return; }
        if (v.paused) {
          card.vuPausadoUsuario = false;
          card.classList.remove('vu-pausado');
          card.setAttribute('aria-pressed', 'false');
          tocar(card);
        } else {
          card.vuPausadoUsuario = true;
          v.pause();
          card.classList.add('vu-pausado');
          card.setAttribute('aria-pressed', 'true');
        }
      });
      io.observe(card);
    });
    document.addEventListener('visibilitychange', function () {
      [].forEach.call(cards, function (card) {
        if (document.hidden) parar(card); else if (card.vuVisivel) tocar(card);
      });
    });
  }

  // ---------------------------------------------------------------- inserir quando a ancora existir
  // As colecoes da home sao montadas sob demanda (ao rolar), entao a ancora pode aparecer tarde. A faixa so entra com o bloco FORA da
  // tela (abaixo ou acima): inserir em cima de algo visivel empurraria o conteudo (CLS). Se o bloco estiver visivel, espera ele sair.
  var feito = false;
  function visivel(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight || 0);
  }
  function inserir(a) {
    if (document.getElementById('vu-faixa')) return;
    var fonte = '';
    try { fonte = getComputedStyle(a.titulo).fontFamily; } catch (e) {}
    var leve = modoLeve();
    injetarEstilo(fonte || 'inherit');
    var sec = montar(leve, fonte || 'inherit');
    a.bloco.parentNode.insertBefore(sec, a.bloco);
    if (!leve) ligarVideos(sec);
  }
  function tentar() {
    if (feito) return true;
    var a = acharAncora();
    if (!a) return false;
    feito = true;
    if (visivel(a.bloco) && window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        if (es[0] && !es[0].isIntersecting) { io.disconnect(); inserir(a); }
      });
      io.observe(a.bloco);
    } else {
      inserir(a);
    }
    return true;
  }

  // Espera a loja terminar de carregar (e um respiro) antes de mexer no DOM e fica de olho ate a ancora existir.
  function iniciar() {
    var t0 = Date.now(), mo = null, timer = null, agendado = false;
    function parar() { if (mo) mo.disconnect(); if (timer) clearInterval(timer); }
    function checa() {
      agendado = false;
      if (Date.now() - t0 > ESPERA_MS) { parar(); return; }
      if (tentar()) parar();
    }
    if (window.MutationObserver) {
      mo = new MutationObserver(function () {
        if (agendado) return;
        agendado = true;
        setTimeout(checa, 400); // no maximo ~2,5 verificacoes por segundo
      });
      mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
    timer = setInterval(checa, 1000); // rede de seguranca
    checa();
  }
  function aposCarga(fn) {
    if (document.readyState === 'complete') setTimeout(fn, 800);
    else window.addEventListener('load', function () { setTimeout(fn, 800); });
  }

  try {
    aposCarga(iniciar);
  } catch (e) { /* nunca quebra a loja */ }
})();
