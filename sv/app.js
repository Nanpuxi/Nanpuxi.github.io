(function () {
'use strict';

var list = (window.IMAGES || []).slice();
var grid = document.getElementById('grid');
var tagsBox = document.getElementById('filterTags');
var emptyBox = null;
var currentGroup = '__all__';
var view = [];      // 当前筛选后的列表
var idx = -1;       // 灯箱当前下标

/* ===== 工具 ===== */
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove('show'); }, 2000);
}

function fileName(src) {
  return String(src).split('/').pop();
}

function titleOf(item) {
  return item.title || fileName(item.src).replace(/\.[^.]+$/, '');
}

/* ===== 渲染筛选标签 ===== */
function renderTags() {
  var groups = [];
  list.forEach(function (it) {
    if (it.group && groups.indexOf(it.group) === -1) groups.push(it.group);
  });
  var html = '<span class="tag active" data-group="__all__">全部</span>';
  groups.forEach(function (g) {
    html += '<span class="tag" data-group="' + g + '">' + g + '</span>';
  });
  tagsBox.insertAdjacentHTML('beforeend', html.slice('<span class="tag active" data-group="__all__">全部</span>'.length));

  tagsBox.querySelectorAll('.tag').forEach(function (el) {
    el.addEventListener('click', function () {
      tagsBox.querySelectorAll('.tag').forEach(function (x) { x.classList.remove('active'); });
      el.classList.add('active');
      currentGroup = el.dataset.group;
      renderGrid();
    });
  });
}

/* ===== 渲染卡片 ===== */
function renderGrid() {
  view = list.filter(function (it) {
    return currentGroup === '__all__' || it.group === currentGroup;
  });

  if (!view.length) {
    grid.innerHTML = '';
    if (!emptyBox) {
      emptyBox = document.createElement('div');
      emptyBox.className = 'empty';
      emptyBox.innerHTML = '还没有图片。<br>把图片放进 <code>img/</code> 目录，然后在 <code>images.js</code> 里加一行：<br><code>{ src: "img/线路图.png", title: "线路图", group: "线路图" }</code>';
      grid.appendChild(emptyBox);
    }
    return;
  }
  if (emptyBox) { emptyBox.remove(); emptyBox = null; }

  grid.innerHTML = view.map(function (it, i) {
    var badge = it.badge ? '<span class="card-badge">' + it.badge + '</span>' : '';
    return '<button class="card" data-i="' + i + '">' +
             '<img class="card-thumb" src="' + it.src + '" alt="' + titleOf(it) + '" loading="lazy" ' +
               'onerror="this.outerHTML=\'<div class=&quot;card-thumb-missing&quot;>图片未找到</div&gt;\'">' +
             '<div class="card-header">' +
               '<span class="card-icon">🖼️</span>' +
               '<span class="card-title">' + titleOf(it) + '</span>' + badge +
             '</div>' +
             '<div class="card-desc">' + fileName(it.src) + '</div>' +
           '</button>';
  }).join('');

  grid.querySelectorAll('.card').forEach(function (el) {
    el.addEventListener('click', function () {
      openLightbox(parseInt(el.dataset.i, 10));
    });
  });
}

/* ===== 灯箱 ===== */
var lb = document.getElementById('lightbox');
var lbImg = document.getElementById('lbImg');
var lbStage = document.getElementById('lbStage');
var scale = 1, tx = 0, ty = 0;
var dragging = false, sx = 0, sy = 0, moved = false;

function applyTransform(anim) {
  lbImg.classList.toggle('no-anim', !anim);
  lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
}

function resetTransform() {
  scale = 1; tx = 0; ty = 0;
  applyTransform(false);
}

function zoomBy(factor, cx, cy) {
  var rect = lbStage.getBoundingClientRect();
  var px = (cx === undefined ? rect.width / 2 : cx - rect.left);
  var py = (cy === undefined ? rect.height / 2 : cy - rect.top);
  var next = Math.min(8, Math.max(0.1, scale * factor));
  if (next === scale) return;
  // 以光标为锚点缩放
  var k = next / scale;
  tx = px - (px - tx) * k;
  ty = py - (py - ty) * k;
  scale = next;
  applyTransform(true);
}

function openLightbox(i) {
  if (!view.length) return;
  idx = Math.max(0, Math.min(view.length - 1, i));
  var item = view[idx];
  lbImg.src = item.src;
  lbImg.alt = titleOf(item);
  document.getElementById('lbTitle').textContent = titleOf(item);
  lb.classList.add('show');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  resetTransform();

  // 读取真实尺寸
  lbImg.onload = function () {
    document.getElementById('lbMeta').textContent =
      lbImg.naturalWidth + ' × ' + lbImg.naturalHeight + ' · ' + (idx + 1) + ' / ' + view.length;
  };
}

function closeLightbox() {
  lb.classList.remove('show');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lbImg.src = '';
}

function step(d) {
  if (!view.length) return;
  openLightbox((idx + d + view.length) % view.length);
}

/* 灯箱事件 */
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
document.getElementById('lbNext').addEventListener('click', function () { step(1); });
document.getElementById('lbZoomIn').addEventListener('click', function () { zoomBy(1.25); });
document.getElementById('lbZoomOut').addEventListener('click', function () { zoomBy(0.8); });
document.getElementById('lbReset').addEventListener('click', resetTransform);
document.getElementById('lbOpen').addEventListener('click', function () {
  if (view[idx]) window.open(view[idx].src, '_blank');
});
document.getElementById('lbCopy').addEventListener('click', function () {
  if (!view[idx]) return;
  var url = new URL(view[idx].src, location.href).href;
  navigator.clipboard.writeText(url)
    .then(function () { showToast('已复制图片链接'); })
    .catch(function () { showToast('复制失败，请手动复制'); });
});

/* 滚轮缩放 */
lbStage.addEventListener('wheel', function (e) {
  if (!lb.classList.contains('show')) return;
  e.preventDefault();
  zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY);
}, { passive: false });

/* 拖拽平移 */
lbStage.addEventListener('mousedown', function (e) {
  if (!lb.classList.contains('show')) return;
  dragging = true; moved = false;
  sx = e.clientX - tx; sy = e.clientY - ty;
  lbStage.classList.add('dragging');
});
window.addEventListener('mousemove', function (e) {
  if (!dragging) return;
  var nx = e.clientX - sx, ny = e.clientY - sy;
  if (Math.abs(nx - tx) + Math.abs(ny - ty) > 2) moved = true;
  tx = nx; ty = ny;
  applyTransform(false);
});
window.addEventListener('mouseup', function () {
  if (!dragging) return;
  dragging = false;
  lbStage.classList.remove('dragging');
});

/* 点空白处关闭（拖动后不关） */
lbStage.addEventListener('click', function (e) {
  if (e.target === lbStage && !moved) closeLightbox();
});

/* 键盘 */
document.addEventListener('keydown', function (e) {
  if (!lb.classList.contains('show')) return;
  var k = e.key;
  if (k === 'Escape') closeLightbox();
  else if (k === 'ArrowLeft') step(-1);
  else if (k === 'ArrowRight') step(1);
  else if (k === '+' || k === '=') zoomBy(1.25);
  else if (k === '-' || k === '_') zoomBy(0.8);
  else if (k === 'r' || k === 'R') resetTransform();
});

/* ===== 导航锚点平滑滚动 ===== */
document.querySelectorAll('.nav-anchor').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var targetEl = document.getElementById(this.getAttribute('href').slice(1));
    if (!targetEl) return;
    e.preventDefault();
    var navH = document.querySelector('.nav').offsetHeight;
    window.scrollTo({
      top: targetEl.getBoundingClientRect().top + window.pageYOffset - navH - 16,
      behavior: 'smooth'
    });
  });
});

/* ===== 回到顶部 ===== */
var backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', function () {
  requestAnimationFrame(function () {
    backBtn.classList.toggle('visible', window.scrollY > 30);
  });
}, { passive: true });
backBtn.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== 深色模式切换 ===== */
(function () {
  var btn = document.getElementById('themeToggle');
  var root = document.documentElement;
  btn.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    if (next === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', next); } catch (err) {}
  });
})();


/* ===== 启动哦 ===== */
renderTags();
renderGrid();

})();
