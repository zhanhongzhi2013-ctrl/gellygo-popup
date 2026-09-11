/* GellyGo Popup — 嵌入脚本(自包含:拉取配置→渲染→提交双写) */
(function () {
  'use strict';
  if (window.__ggPopupLoaded) return;
  window.__ggPopupLoaded = true;

  var script = document.currentScript;
  var API = (script && script.src) ? new URL(script.src).origin : '';
  var PREVIEW = window.GGP_PREVIEW !== undefined ? String(window.GGP_PREVIEW || '') : null;

  var KEY_DISMISS = 'ggp_dismissed_at', KEY_DONE = 'ggp_signed_up';

  fetch(API + '/api/config' + (PREVIEW ? '?t=' + encodeURIComponent(PREVIEW) : ''))
    .then(function (r) { return r.json(); })
    .then(init)
    .catch(function (e) { console.warn('[ggp] config load failed', e); });

  function init(cfg) {
    var s = cfg.settings, t = cfg.template, c = t.colors || {};
    var capped = false; /* 频次期内:不自动弹,但显示浮标 */
    if (!PREVIEW) {
      try {
        if (localStorage.getItem(KEY_DONE)) return; /* 已订阅:什么都不显示 */
        var dis = parseInt(localStorage.getItem(KEY_DISMISS) || '0', 10);
        if (dis && Date.now() - dis < (s.frequencyDays || 7) * 864e5) capped = true;
      } catch (e) {}
    }

    var css = '' +
      '.ggp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:2147483000;display:none;align-items:center;justify-content:center;padding:16px}' +
      '.ggp-overlay.ggp-open{display:flex;animation:ggpFade .25s}' +
      '@keyframes ggpFade{from{opacity:0}to{opacity:1}}' +
      '@keyframes ggpPop{from{transform:translateY(24px) scale(.97);opacity:0}to{transform:none;opacity:1}}' +
      '.ggp{width:100%;max-width:760px;display:grid;grid-template-columns:44% 56%;background:' + c.bg + ';color:' + c.ink + ';border:1px solid ' + c.accent2 + ';box-shadow:0 30px 80px rgba(0,0,0,.6);animation:ggpPop .35s;position:relative;overflow:hidden;font-family:Arial,Helvetica,sans-serif;text-align:left}' +
      '.ggp *{margin:0;padding:0;box-sizing:border-box}' +
      '.ggp-close{position:absolute;top:10px;right:14px;background:none;border:none;color:' + c.ink + ';font-size:26px;line-height:1;cursor:pointer;opacity:.7;z-index:5;font-family:Courier New,monospace}' +
      '.ggp-vis{position:relative;background:' + c.vis + ';display:flex;flex-direction:column;justify-content:space-between;padding:26px 22px;min-height:380px;overflow:hidden}' +
      '.ggp-tag{font-family:Courier New,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:' + c.tag + '}' +
      '.ggp-big{font-family:Arial Black,Arial,sans-serif;text-transform:uppercase;font-size:clamp(30px,4.5vw,46px);line-height:.92;color:' + c.visInk + ';position:relative;z-index:2}' +
      '.ggp-big em{font-style:normal;color:' + c.accent + '}' +
      '.ggp-deco{position:absolute;bottom:-20px;right:-10px;font-family:Arial Black,Arial;font-size:110px;line-height:1;opacity:.14;pointer-events:none;z-index:1}' +
      '.ggp-body{padding:30px 28px 24px;display:flex;flex-direction:column;justify-content:center}' +
      '.ggp-kicker{font-family:Courier New,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:' + c.accent2 + ';margin-bottom:10px}' +
      '.ggp-title{font-family:Arial Black,Arial,sans-serif;font-size:24px;text-transform:uppercase;line-height:1.05;margin-bottom:10px;color:' + c.ink + '}' +
      '.ggp-sub{font-size:13px;line-height:1.6;opacity:.8;margin-bottom:18px;font-family:Courier New,monospace}' +
      '.ggp-form{display:flex;flex-direction:column;gap:10px}' +
      '.ggp-form input{width:100%;padding:13px 14px;font-family:Courier New,monospace;font-size:13px;background:' + c.field + ';color:' + c.ink + ';border:1px solid ' + c.fieldBd + ';outline:none;border-radius:0}' +
      '.ggp-form input:focus{border-color:' + c.accent2 + '}' +
      '.ggp-form input.ggp-err{border-color:#ff4d4d}' +
      '.ggp-errmsg{font-family:Courier New,monospace;font-size:11px;color:#ff6b6b;display:none}' +
      '.ggp-errmsg.ggp-show{display:block}' +
      '.ggp-cta{padding:14px;font-family:Arial Black,Arial,sans-serif;font-size:14px;letter-spacing:.08em;text-transform:uppercase;background:' + c.cta + ';color:' + c.ctaInk + ';border:none;cursor:pointer;border-radius:0}' +
      '.ggp-cta[disabled]{opacity:.6;cursor:wait}' +
      '.ggp-fine{font-family:Courier New,monospace;font-size:10px;opacity:.55;margin-top:12px;line-height:1.6;text-transform:uppercase}' +
      '.ggp-dismiss{background:none;border:none;font-family:Courier New,monospace;font-size:11px;color:' + c.ink + ';opacity:.5;text-decoration:underline;cursor:pointer;margin-top:10px;align-self:center}' +
      '.ggp-done{display:none;text-align:center;padding:10px 0}' +
      '.ggp.ggp-ok .ggp-form,.ggp.ggp-ok .ggp-kicker,.ggp.ggp-ok .ggp-title,.ggp.ggp-ok .ggp-sub,.ggp.ggp-ok .ggp-dismiss,.ggp.ggp-ok .ggp-cd{display:none}' +
      '.ggp.ggp-ok .ggp-done{display:block}' +
      '.ggp-chk{font-size:34px;color:' + c.accent2 + '}' +
      '.ggp-done h3{font-family:Arial Black,Arial,sans-serif;text-transform:uppercase;font-size:20px;margin:8px 0 14px;color:' + c.ink + '}' +
      '.ggp-code{display:inline-block;font-family:Courier New,monospace;font-size:20px;font-weight:bold;letter-spacing:.12em;border:2px dashed ' + c.accent2 + ';padding:12px 22px;margin-bottom:12px;cursor:pointer;color:' + c.ink + ';transition:all .15s}' +
      '.ggp-code.ggp-copied{background:' + c.accent2 + ';color:' + c.bg + ';border-style:solid;transform:scale(1.04)}' +
      '.ggp-done p{font-family:Courier New,monospace;font-size:11px;opacity:.65;text-transform:uppercase}' +
      '.ggp-done p.ggp-copied{color:' + c.accent2 + ';opacity:1;font-size:14px;font-weight:bold;animation:ggpNote .3s}' +
      '@keyframes ggpNote{from{transform:scale(.85)}to{transform:none}}' +
      '.ggp-cd{display:flex;gap:8px;margin:4px 0 16px}' +
      '.ggp-cd div{background:rgba(0,0,0,.35);border:1px solid ' + c.fieldBd + ';padding:8px 0;flex:1;text-align:center}' +
      '.ggp-cd b{display:block;font-family:Arial Black,Arial,sans-serif;font-size:20px;color:' + c.ink + '}' +
      '.ggp-cd span{font-family:Courier New,monospace;font-size:9px;text-transform:uppercase;opacity:.6}' +
      '@media(max-width:640px){.ggp{grid-template-columns:1fr;max-width:420px}.ggp-vis{min-height:130px;padding:20px}.ggp-big{font-size:26px}}' +
      /* 枪形浮标(点击重新打开弹窗) */
      '.ggp-teaser{position:fixed;left:16px;bottom:16px;z-index:2147482999;display:none;align-items:center;gap:0;cursor:pointer;font-family:Arial Black,Arial,sans-serif;filter:drop-shadow(0 6px 18px rgba(0,0,0,.45));transition:transform .15s}' +
      '.ggp-teaser:hover{transform:translateY(-2px)}' +
      '.ggp-teaser.ggp-on{display:flex;animation:ggpTease .4s}' +
      '@keyframes ggpTease{from{transform:translateY(60px);opacity:0}to{transform:none;opacity:1}}' +
      '.ggp-teaser-icon{width:58px;height:58px;border-radius:50%;background:' + c.bg + ';border:2px solid ' + c.accent2 + ';display:flex;align-items:center;justify-content:center;position:relative;animation:ggpPulse 2.4s infinite}' +
      '@keyframes ggpPulse{0%,100%{box-shadow:0 0 0 0 ' + c.accent2 + '66}50%{box-shadow:0 0 0 9px transparent}}' +
      '.ggp-teaser-icon svg{width:36px;height:22px;display:block}' +
      '.ggp-teaser-tag{background:' + c.accent2 + ';color:' + c.bg + ';font-size:11px;letter-spacing:.08em;padding:6px 10px;margin-left:-6px;text-transform:uppercase;white-space:nowrap;border-radius:2px}' +
      '@media(max-width:640px){.ggp-teaser{left:10px;bottom:10px}.ggp-teaser-icon{width:48px;height:48px}.ggp-teaser-icon svg{width:30px;height:18px}}';
    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var ov = document.createElement('div');
    ov.className = 'ggp-overlay';
    ov.innerHTML =
      '<div class="ggp" role="dialog" aria-modal="true">' +
        '<button class="ggp-close" type="button" aria-label="Close">×</button>' +
        '<div class="ggp-vis"><div class="ggp-tag"></div><div class="ggp-big"></div><div class="ggp-deco"></div></div>' +
        '<div class="ggp-body">' +
          '<div class="ggp-kicker"></div><h2 class="ggp-title"></h2><p class="ggp-sub"></p>' +
          (t.cd ? '<div class="ggp-cd"><div><b data-cd="d">00</b><span>DAYS</span></div><div><b data-cd="h">00</b><span>HRS</span></div><div><b data-cd="m">00</b><span>MIN</span></div><div><b data-cd="s">00</b><span>SEC</span></div></div>' : '') +
          '<form class="ggp-form" novalidate>' +
            '<input type="email" name="email" placeholder="EMAIL ADDRESS *" autocomplete="email">' +
            '<div class="ggp-errmsg" data-err="email">Enter a valid email</div>' +
            (s.collectPhone ? '<input type="tel" name="phone" placeholder="PHONE — OPTIONAL, FOR DROP ALERTS" autocomplete="tel"><div class="ggp-errmsg" data-err="phone">Invalid phone number</div>' : '') +
            '<button type="submit" class="ggp-cta"></button>' +
          '</form>' +
          '<div class="ggp-done"><div class="ggp-chk">▼▼▼</div><h3>You’re on the list</h3><div class="ggp-code" title="Click to copy"></div><p class="ggp-note">CLICK CODE TO COPY · APPLIES AT CHECKOUT</p></div>' +
          '<button class="ggp-dismiss" type="button"></button>' +
          '<div class="ggp-fine">NO SPAM · UNSUBSCRIBE ANY TIME · ADULT PAYMENT METHOD REQUIRED · AGES 14+</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);

    /* 文案注入(innerHTML 仅用于 big,其余用 textContent 防注入) */
    ov.querySelector('.ggp-tag').textContent = t.tag || '';
    ov.querySelector('.ggp-big').innerHTML = t.big || '';
    ov.querySelector('.ggp-deco').textContent = t.deco || '';
    ov.querySelector('.ggp-kicker').textContent = t.kicker || '';
    ov.querySelector('.ggp-title').textContent = t.title || '';
    ov.querySelector('.ggp-sub').textContent = t.sub || '';
    ov.querySelector('.ggp-cta').textContent = t.cta || 'SIGN UP';
    ov.querySelector('.ggp-dismiss').textContent = t.no || 'Not now';
    ov.querySelector('.ggp-code').textContent = t.code || '';

    /* 枪形浮标:圆形按钮 + gel blaster 剪影(含合规橙色枪口) + 优惠标签 */
    var teaserOn = s.teaser !== false;
    var teaser = null;
    if (teaserOn) {
      teaser = document.createElement('div');
      teaser.className = 'ggp-teaser';
      teaser.setAttribute('role', 'button');
      teaser.setAttribute('aria-label', 'Open signup offer');
      teaser.innerHTML =
        '<div class="ggp-teaser-icon">' +
          '<svg viewBox="0 0 96 48" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="' + (c.accent2 || '#c8ff00') + '">' +
              '<path d="M28 16 L8 13 L2 17 L2 27 L12 27 L28 26 Z"/>' +
              '<rect x="28" y="15" width="40" height="11"/>' +
              '<rect x="33" y="10" width="9" height="5"/>' +
              '<rect x="68" y="18" width="20" height="4"/>' +
              '<rect x="74" y="13" width="3" height="5"/>' +
              '<path d="M40 26 L47 26 L42 37 L35 37 Z"/>' +
              '<path d="M52 26 L66 26 L60 41 L48 39 Z"/>' +
            '</g>' +
            '<rect x="88" y="17" width="6" height="6" fill="#ff7a1a"/>' +
          '</svg>' +
        '</div>' +
        '<div class="ggp-teaser-tag">' + ((s.teaserText || '10% OFF').replace(/[<>]/g, '')) + '</div>';
      document.body.appendChild(teaser);
    }
    function showTeaser() { if (teaser && !PREVIEW) teaser.classList.add('ggp-on'); }
    function hideTeaser() { if (teaser) teaser.classList.remove('ggp-on'); }

    var pop = ov.querySelector('.ggp'), form = ov.querySelector('.ggp-form'), shown = false;
    var openedAt = Date.now();
    function open(force) { if (shown && !force) return; shown = true; hideTeaser(); ov.classList.add('ggp-open'); document.documentElement.style.overflow = 'hidden'; }
    function close(remember) {
      ov.classList.remove('ggp-open'); document.documentElement.style.overflow = '';
      if (remember && !PREVIEW) {
        try { localStorage.setItem(KEY_DISMISS, String(Date.now())); } catch (e) {}
        showTeaser(); /* 关掉弹窗后浮标接力,改主意随时点开 */
      }
    }
    if (teaser) teaser.addEventListener('click', function () { open(true); ov.classList.add('ggp-open'); });

    /* 触发策略(据 2026 转化数据):延时 8s 或 滚动 35%(先到先弹)+ 退出意图;
       频次期内不自动弹,只显示浮标 */
    if (PREVIEW) { open(); }
    else if (capped) { showTeaser(); }
    else {
      setTimeout(function () { open(); }, Math.max(0, s.delay == null ? 8 : s.delay) * 1000);
      var sp = s.scrollPercent == null ? 35 : s.scrollPercent;
      if (sp > 0) {
        var onScroll = function () {
          var h = document.documentElement;
          var max = h.scrollHeight - h.clientHeight;
          if (max > 0 && (h.scrollTop / max) * 100 >= sp) { open(); window.removeEventListener('scroll', onScroll); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
      }
      if (s.exitIntent) document.addEventListener('mouseout', function (e) {
        if (!e.relatedTarget && e.clientY <= 0 && Date.now() - openedAt > 3000) open();
      });
    }
    ov.querySelector('.ggp-close').addEventListener('click', function () { close(true); });
    ov.querySelector('.ggp-dismiss').addEventListener('click', function () { close(true); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(true); });

    if (t.cd) {
      var end = t.cdEnd ? new Date(String(t.cdEnd).replace(' ', 'T')) : null;
      if (!end || isNaN(end)) { end = new Date(); end.setHours(23, 59, 59, 999); }
      var q = function (k) { return ov.querySelector('[data-cd=' + k + ']'); };
      var tick = function () {
        var sec = Math.max(0, Math.floor((end - Date.now()) / 1000));
        q('d').textContent = String(Math.floor(sec / 86400)).padStart(2, '0');
        q('h').textContent = String(Math.floor(sec % 86400 / 3600)).padStart(2, '0');
        q('m').textContent = String(Math.floor(sec % 3600 / 60)).padStart(2, '0');
        q('s').textContent = String(sec % 60).padStart(2, '0');
      };
      tick(); setInterval(tick, 1000);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailEl = form.querySelector('[name=email]'), phoneEl = form.querySelector('[name=phone]');
      var email = emailEl.value.trim(), phone = phoneEl ? phoneEl.value.trim() : '';
      var ok = true;
      ov.querySelectorAll('.ggp-errmsg').forEach(function (el) { el.classList.remove('ggp-show'); });
      ov.querySelectorAll('input').forEach(function (el) { el.classList.remove('ggp-err'); });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { emailEl.classList.add('ggp-err'); ov.querySelector('[data-err=email]').classList.add('ggp-show'); ok = false; }
      if (phone && !/^\+?[\d\s()-]{7,15}$/.test(phone)) { phoneEl.classList.add('ggp-err'); ov.querySelector('[data-err=phone]').classList.add('ggp-show'); ok = false; }
      if (!ok) return;

      var btn = form.querySelector('.ggp-cta');
      btn.disabled = true; btn.textContent = '...';

      /* 1) 写入 Railway 数据库 */
      var p1 = fetch(API + '/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, phone: phone, template: t.id })
      }).catch(function () {});

      /* 2) 双写 Shopify 客户列表(原生 /contact 表单) */
      var shop = (s.shopDomain || '').replace(/\/$/, '') || (location.origin.indexOf('http') === 0 ? location.origin : '');
      var p2 = Promise.resolve();
      if (shop && !PREVIEW) {
        var fd = new FormData();
        fd.append('form_type', 'customer'); fd.append('utf8', '✓');
        fd.append('contact[email]', email);
        if (phone) fd.append('contact[phone]', phone);
        fd.append('contact[tags]', 'newsletter,popup,popup-' + t.id);
        p2 = fetch(shop + '/contact', { method: 'POST', body: fd, mode: 'no-cors' }).catch(function () {});
      }

      Promise.all([p1, p2]).then(function () {
        pop.classList.add('ggp-ok');
        if (teaser) { teaser.remove(); teaser = null; } /* 已订阅,浮标退场 */
        if (!PREVIEW) { try { localStorage.setItem(KEY_DONE, '1'); } catch (e2) {} }
      });
    });

    ov.querySelector('.ggp-code').addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(this.textContent.trim());
      this.classList.add('ggp-copied');
      var note = ov.querySelector('.ggp-note');
      note.textContent = '✓ COPIED! PASTE AT CHECKOUT';
      note.classList.remove('ggp-copied'); void note.offsetWidth; /* 重触发动画 */
      note.classList.add('ggp-copied');
    });
  }
})();
