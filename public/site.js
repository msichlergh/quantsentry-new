(function(){
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(n, dp){ return n.toLocaleString('en-GB', {minimumFractionDigits:dp, maximumFractionDigits:dp}); }
  function parse(el){
    var o = {}; (el.dataset.vals||'').split(';').forEach(function(p){
      var kv = p.split(':'); if (kv.length===2) o[kv[0]] = parseFloat(kv[1]); }); return o;
  }
  function count(el, to){
    var dp = (String(to).split('.')[1]||'').length;
    var pre = el.dataset.prefix||'', suf = el.dataset.suffix||'';
    if (rm){ el.textContent = pre + fmt(to, dp) + suf; return; }
    var from = parseFloat(String(el.textContent).replace(/[^0-9.]/g,'')) || 0;
    var t0 = performance.now(), dur = 900;
    (function step(t){
      var k = Math.min(1, (t-t0)/dur), e = 1 - Math.pow(1-k, 3);
      el.textContent = pre + fmt(from + (to-from)*e, dp) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  // segmented controls swap the window's figures
  document.querySelectorAll('.seg button').forEach(function(b){
    b.addEventListener('click', function(){
      var app = b.closest('.app'), k = b.dataset.k;
      app.querySelectorAll('.seg button').forEach(function(x){ x.classList.toggle('on', x===b); });
      app.querySelectorAll('.kpi .v').forEach(function(v){
        var o = parse(v); if (k in o) count(v, o[k]);
      });
      var sp = app.querySelector('.spark');
      if (sp){ sp.parentElement.classList.remove('drawn'); void sp.offsetWidth;
               sp.parentElement.classList.add('drawn'); }
    });
  });
  // reveal on scroll, then start counters, bars and the chart
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      el.querySelectorAll('.kpi .v').forEach(function(v){
        var o = parse(v), sel = el.querySelector('.seg button.on');
        var k = sel ? sel.dataset.k : Object.keys(o)[0];
        if (k in o) count(v, o[k]);
      });
      el.querySelectorAll('.arow').forEach(function(r, i){
        setTimeout(function(){ r.classList.add('in'); }, rm ? 0 : 60*i);
      });
      el.querySelectorAll('.bar i').forEach(function(b, i){
        setTimeout(function(){ b.style.width = b.dataset.w + '%'; }, rm ? 0 : 200 + 60*i);
      });
      var box = el.querySelector('.chartbox') || el;
      if (el.querySelector('.spark')) box.classList.add('drawn');
      io.unobserve(el);
    });
  }, {threshold: .18});
  document.querySelectorAll('.reveal, .app').forEach(function(el){ io.observe(el); });

  var hdr = document.getElementById('hdr');
  if (hdr){ var onScroll = function(){ hdr.classList.toggle('stuck', window.scrollY > 12); };
            onScroll(); addEventListener('scroll', onScroll, {passive:true}); }
  document.querySelectorAll('.tabs button').forEach(function(b){
    var go = function(){
      var scope = b.closest('section') || document, n = b.dataset.tab, i = b.dataset.i;
      scope.querySelectorAll('.tabs button[data-tab="'+n+'"]').forEach(function(x){
        x.classList.toggle('on', x === b); });
      scope.querySelectorAll('.tabpane[data-tab="'+n+'"]').forEach(function(pn){
        pn.classList.toggle('on', pn.dataset.i === i); });
    };
    b.addEventListener('click', go);
  });
  var chatIo = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      var box = e.target, msgs = [].slice.call(box.querySelectorAll('.msg')), i = 0;
      chatIo.unobserve(box);
      if (rm){ msgs.forEach(function(m){ m.classList.add('in'); }); return; }
      (function next(){
        if (i >= msgs.length) return;
        var m = msgs[i++];
        if (m.classList.contains('bot')){
          var t = document.createElement('span');
          t.className = 'typing chat-typing';
          t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
          m.classList.add('in', 'is-typing');
          m.appendChild(t);
          setTimeout(function(){
            t.remove(); m.classList.remove('is-typing'); setTimeout(next, 340);
          }, 760);
        } else { setTimeout(function(){ m.classList.add('in'); next(); }, 300); }
      })();
    });
  }, {threshold:.3});
  document.querySelectorAll('[data-chat]').forEach(function(c){ chatIo.observe(c); });
  var syncs = [].slice.call(document.querySelectorAll('.sync'));
  if (syncs.length){
    var lite = function(){
      syncs.forEach(function(el){
        var r = el.getBoundingClientRect(), h = innerHeight;
        var k = Math.min(1, Math.max(0, (h * .82 - r.top) / (r.height + h * .28)));
        var ws = el.querySelectorAll('span'), n = Math.round(k * ws.length);
        ws.forEach(function(w, i){ w.classList.toggle('lit', i < n); });
      });
    };
    lite(); addEventListener('scroll', lite, {passive:true});
  }
  document.querySelectorAll('[data-type]').forEach(function(el){
    var list = JSON.parse(el.dataset.type), i = 0, j = 0, del = false;
    if (rm){ el.textContent = list[0]; el.classList.remove('type'); return; }
    (function tick(){
      if (!el.isConnected || !el.dataset.type) return;
      var w = list[i]; j += del ? -1 : 1; el.textContent = w.slice(0, j);
      var wait = del ? 34 : 62;
      if (!del && j === w.length){ del = true; wait = 2000; }
      else if (del && j === 0){ del = false; i = (i + 1) % list.length; wait = 260; }
      setTimeout(tick, wait);
    })();
  });

  // two trades compared: edit the variables a cheater edits, watch the match hold
  document.querySelectorAll('[data-sim]').forEach(function(app){
    var cells = app.querySelectorAll('.simgrid i'),
        chips = app.querySelectorAll('.vchip'),
        out = app.querySelector('[data-simcount]'),
        vd = app.querySelector('[data-simverdict]');
    var paint = function(){
      var edits = 0;
      chips.forEach(function(c, i){
        var on = c.classList.contains('on');
        var row = app.querySelector('.simrow[data-row="' + i + '"]');
        if (row){
          var b = row.querySelector('[data-b]'), m = row.querySelector('[data-m]');
          b.textContent = on ? b.dataset.edit : b.dataset.orig;
          b.classList.toggle('edited', on);
          m.textContent = on ? 'edited' : 'match';
          m.style.color = on ? 'var(--red)' : 'var(--grn)';
        }
        if (on) edits++;
      });
      cells.forEach(function(c, i){ c.classList.toggle('chg', i < edits); });
      var same = 130 - edits;
      out.textContent = same;
      var ok = same >= 118;
      vd.innerHTML = '<span class="dot" style="background:' + (ok ? 'var(--cy)' : 'var(--amb)') + '"></span>'
        + (ok ? 'Still the same hand' : 'Still linked, score reduced');
      vd.style.borderColor = ok ? 'rgba(0,255,255,.35)' : 'rgba(240,180,41,.45)';
      vd.style.color = ok ? 'var(--cy)' : 'var(--amb)';
    };
    chips.forEach(function(c){
      c.addEventListener('click', function(){ c.classList.toggle('on'); paint(); });
    });
    paint();
  });
  // markets: pick one and the figures follow
  document.querySelectorAll('[data-geo-app]').forEach(function(app){
    app.querySelectorAll('.georow').forEach(function(r){
      r.addEventListener('click', function(){
        app.querySelectorAll('.georow').forEach(function(x){ x.classList.toggle('on', x === r); });
        app.querySelector('[data-geo-name]').textContent = r.dataset.n;
        count(app.querySelector('[data-geo-a]'), parseFloat(r.dataset.a));
        count(app.querySelector('[data-geo-f]'), parseFloat(r.dataset.f));
      });
    });
  });
  // identity resolution: 61 registrations collapse into the operators behind them
  document.querySelectorAll('[data-resolve]').forEach(function(app){
    var btn = app.querySelector('[data-resolve-btn]'), done = false;
    btn.addEventListener('click', function(){
      if (done){
        app.querySelectorAll('.tacct').forEach(function(a){ a.classList.remove('linked'); });
        count(app.querySelector('[data-resolve-n]'), 61);
        count(app.querySelector('[data-resolve-l]'), 0);
        app.querySelector('[data-resolve-s]').textContent = 'Before resolution';
        app.querySelector('[data-resolve-note]').textContent = 'Each of these passed KYC on its own.';
        btn.querySelector('span').textContent = 'Resolve Identities';
        done = false; return;
      }
      var accs = app.querySelectorAll('.tacct');
      accs.forEach(function(a, i){
        setTimeout(function(){ a.classList.add('linked'); }, rm ? 0 : 40 * i);
      });
      count(app.querySelector('[data-resolve-n]'), 4);
      count(app.querySelector('[data-resolve-l]'), 57);
      app.querySelector('[data-resolve-s]').textContent = 'After resolution';
      app.querySelector('[data-resolve-note]').textContent =
        'Fifty seven links by device, payment method and session. Four people, sixty one accounts.';
      btn.querySelector('span').textContent = 'Reset';
      done = true;
    });
  });

  // blind spot finder
  (function(){
    var box = document.querySelector('[data-quiz]');
    if (!box) return;
    var steps = box.querySelectorAll('.qstep'),
        bar = box.querySelector('[data-qbar]'),
        result = box.querySelector('.qresult'),
        gaps = JSON.parse(box.dataset.gaps || '{}'),
        score = {}, at = 0;
    var show = function(i){
      steps.forEach(function(s, n){ s.classList.toggle('on', n === i); });
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
    };
    var render = function(){
      var ranked = Object.keys(score).filter(function(k){ return score[k] > 0; })
        .sort(function(a, b){ return score[b] - score[a]; }).slice(0, 3);
      var wrap = box.querySelector('.qgaps');
      if (!ranked.length){
        box.querySelector('[data-qtitle]').textContent = 'Nothing obvious is missing';
        box.querySelector('[data-qlede]').textContent =
          'On these six questions you are already doing the things most firms are not. The value here is '
          + 'depth rather than repair: proving it faster, and seeing what it is worth.';
        wrap.innerHTML = '';
      } else {
        box.querySelector('[data-qtitle]').textContent =
          ranked.length === 1 ? 'One blind spot worth closing'
          : (ranked.length === 2 ? 'Two blind spots worth closing' : 'Three blind spots worth closing');
        box.querySelector('[data-qlede]').textContent =
          'Ranked by what they are likely costing you, in the order we would tackle them.';
        wrap.innerHTML = ranked.map(function(k, i){
          var g = gaps[k], sc = score[k];
          var sev = sc >= 5 ? ['Acute', 'var(--red)'] : (sc >= 3 ? ['Material', 'var(--amb)']
                                                                : ['Worth a look', 'var(--cy)']);
          return '<div class="qgap"><span class="n">0' + (i + 1) + '</span><div>'
            + '<div class="row" style="justify-content:space-between;gap:14px">'
            + '<h4>' + g[0] + '</h4>'
            + '<span class="sev" style="color:' + sev[1] + '"><span class="dot" style="background:'
            + sev[1] + '"></span>' + sev[0] + '</span></div>'
            + '<p>' + g[1] + '</p>'
            + '<div class="fix"><b style="color:var(--ink)">What closes it.</b> ' + g[2]
            + ' <a href="' + g[3] + '" style="color:var(--cy);font-weight:600">See how</a></div>'
            + '</div></div>';
        }).join('');
      }
      box.querySelector('.qsteps').hidden = true;
      box.querySelector('.qbar').hidden = true;
      result.hidden = false;
      result.scrollIntoView({behavior: rm ? 'auto' : 'smooth', block: 'center'});
    };
    box.querySelectorAll('.qopt').forEach(function(b){
      b.addEventListener('click', function(){
        var w = JSON.parse(b.dataset.w);
        Object.keys(w).forEach(function(k){ score[k] = (score[k] || 0) + w[k]; });
        at++;
        if (at >= steps.length) render(); else show(at);
      });
    });
    var reset = box.querySelector('[data-qreset]');
    if (reset) reset.addEventListener('click', function(){
      score = {}; at = 0; result.hidden = true;
      box.querySelector('.qsteps').hidden = false;
      box.querySelector('.qbar').hidden = false;
      show(0);
      box.scrollIntoView({behavior: rm ? 'auto' : 'smooth', block: 'center'});
    });
    show(0);
  })();

  // Argus playground: pick a question, watch it answer
  document.querySelectorAll('[data-play]').forEach(function(box){
    var data = JSON.parse(box.dataset.asks),
        body = box.querySelector('[data-ask-body]'),
        srcs = box.querySelector('[data-ask-src]'),
        state = box.querySelector('[data-ask-state]');
    var paint = function(i){
      var d = data[i];
      srcs.innerHTML = d.src.map(function(x){
        return '<span class="pill" style="font-size:11px">' + x + '</span>'; }).join('');
      if (rm){
        body.innerHTML = d.rows.map(function(r){
          return '<div class="arow in" style="padding:10px 0"><span class="dot" style="margin-top:8px"></span>'
            + '<span><b style="color:var(--ink);font-size:14px;font-weight:500">' + r[0] + '</b>'
            + '<span style="display:block;font-size:13px;color:var(--ink3);margin-top:3px">' + r[1]
            + '</span></span></div>'; }).join('');
        return;
      }
      state.textContent = 'Reading your data';
      body.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      setTimeout(function(){
        state.textContent = 'Answered against your own data';
        body.innerHTML = d.rows.map(function(r){
          return '<div class="arow" style="padding:10px 0"><span class="dot" style="margin-top:8px"></span>'
            + '<span><b style="color:var(--ink);font-size:14px;font-weight:500">' + r[0] + '</b>'
            + '<span style="display:block;font-size:13px;color:var(--ink3);margin-top:3px">' + r[1]
            + '</span></span></div>'; }).join('');
        [].slice.call(body.querySelectorAll('.arow')).forEach(function(r, n){
          setTimeout(function(){ r.classList.add('in'); }, 90 * n);
        });
      }, 620);
    };
    box.querySelectorAll('.askq').forEach(function(b, i){
      b.addEventListener('click', function(){
        box.querySelectorAll('.askq').forEach(function(x){ x.classList.toggle('on', x === b); });
        paint(i);
      });
    });
    paint(0);
  });
  // call timer ticks while it is on screen
  document.querySelectorAll('[data-calltimer]').forEach(function(el){
    if (rm) return;
    var t = 42;
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        io.unobserve(el);
        setInterval(function(){
          t++;
          el.textContent = '00:' + (t % 60 < 10 ? '0' : '') + (t % 60);
        }, 1000);
      });
    }, {threshold:.4});
    io.observe(el);
  });

  // network signal feed
  document.querySelectorAll('[data-feed]').forEach(function(app){
    var evs = JSON.parse(app.dataset.events),
        list = app.querySelector('[data-feed-list]'),
        btn = app.querySelector('[data-feed-toggle]'),
        i = 0, timer = null, paused = false;
    var colour = function(c){ return 'var(--' + c + ')'; };
    var stamp = function(back){
      var d = new Date(Date.now() - back * 1000);
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)
        + ':' + ('0' + d.getSeconds()).slice(-2);
    };
    var add = function(fresh, back){
      var e = evs[i % evs.length]; i++;
      var row = document.createElement('div');
      row.className = 'fev' + (fresh ? ' fresh' : '');
      row.innerHTML = '<span class="ts">' + stamp(back || 0) + '</span>'
        + '<span class="dot" style="background:' + colour(e.c) + ';margin-top:6px"></span>'
        + '<span><b>' + e.t + '</b><span class="d">' + e.d + '</span></span>';
      list.insertBefore(row, list.firstChild);
      requestAnimationFrame(function(){ row.classList.add('in'); });
      setTimeout(function(){ row.classList.remove('fresh'); }, 2400);
      while (list.children.length > 5) list.removeChild(list.lastChild);
    };
    // seed the window with events that already happened, spaced like real traffic
    [214, 133, 86, 41, 9].forEach(function(sec){ add(false, sec); });
    var start = function(){ if (!timer && !paused && !rm) timer = setInterval(function(){ add(true); }, 2600); };
    var stop = function(){ clearInterval(timer); timer = null; };
    btn.addEventListener('click', function(){
      paused = !paused;
      btn.querySelector('span').textContent = paused ? 'Resume' : 'Pause';
      if (paused) stop(); else start();
    });
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) start(); else stop(); });
    }, {threshold:.2});
    io.observe(app);
  });


  // dot map: signals land, a market opens to its own accounts
  document.querySelectorAll('[data-map]').forEach(function(app){
    var svg = app.querySelector('.dotmap'),
        act = JSON.parse(app.dataset.act),
        tip = app.querySelector('.maptip'),
        feed = app.querySelector('[data-map-feed]'),
        detail = app.querySelector('[data-map-detail]'),
        pings = app.querySelector('.pings'),
        byC = {}, keys = Object.keys(act), open = null;
    [].slice.call(svg.querySelectorAll('circle[data-o]')).forEach(function(c){
      var o = c.dataset.o;
      (byC[o] = byC[o] || []).push(c);
      if (act[o]) c.classList.add('act');
    });
    var EV = ["New device fingerprint identified", "Payment method matched", "Copy pattern surfaced",
              "Identity cluster grew", "Session overlap flagged"];
    var FLAGS = {
      Vietnam: '🇻🇳', Nigeria: '🇳🇬', India: '🇮🇳', Brazil: '🇧🇷',
      'United Kingdom': '🇬🇧', Georgia: '🇬🇪', Philippines: '🇵🇭', Turkey: '🇹🇷',
      Indonesia: '🇮🇩', Pakistan: '🇵🇰', 'United States of America': '🇺🇸',
      Germany: '🇩🇪', Egypt: '🇪🇬', 'South Africa': '🇿🇦', Malaysia: '🇲🇾'
    };
    var stamp = function(){
      var d = new Date();
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)
        + ':' + ('0' + d.getSeconds()).slice(-2);
    };
    var ping = function(){
      var k = keys[Math.floor(Math.random() * keys.length)], list = byC[k];
      if (!list) return;
      var c = list[Math.floor(Math.random() * list.length)];
      c.classList.add('hot');
      setTimeout(function(){ c.classList.remove('hot'); }, 2200);
      var r = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      r.setAttribute('cx', c.getAttribute('cx')); r.setAttribute('cy', c.getAttribute('cy'));
      r.setAttribute('r', '1.5');
      pings.appendChild(r);
      var t0 = performance.now();
      (function grow(t){
        var k2 = Math.min(1, (t - t0) / 1400);
        r.setAttribute('r', (1.5 + k2 * 9).toFixed(2));
        r.style.opacity = (1 - k2) * .9;
        if (k2 < 1) requestAnimationFrame(grow); else r.remove();
      })(t0);
      var row = document.createElement('div');
      row.className = 'mf';
      row.innerHTML = '<span class="eyebrow" style="width:64px;flex:none">' + stamp() + '</span>'
        + '<span class="dot" style="background:var(--cy)"></span>'
        + '<span><b>' + EV[Math.floor(Math.random() * EV.length)] + '</b> in '
        + '<span class="alert-country-flag" aria-hidden="true">' + FLAGS[act[k][0]] + '</span>'
        + act[k][0] + '</span>';
      feed.insertBefore(row, feed.firstChild);
      requestAnimationFrame(function(){ row.classList.add('in'); });
      while (feed.children.length > 4) feed.removeChild(feed.lastChild);
    };
    var openCountry = function(k){
      open = k;
      var name = act[k][0], accts = act[k][1], bad = act[k][2];
      Object.keys(byC).forEach(function(o){
        byC[o].forEach(function(c){ c.classList.toggle('on', o === k); });
      });
      var dots = '';
      for (var i = 0; i < accts; i++) dots += '<i class="' + (i < bad ? 'bad' : '') + '"></i>';
      detail.innerHTML =
        '<div class="row" style="justify-content:space-between"><div class="eyebrow" '
        + 'style="color:var(--cy)">' + name + '</div>'
        + '<span style="font-size:11.5px;color:var(--ink4)">' + accts + ' accounts, ' + bad
        + ' flagged</span></div>'
        + '<div class="acctdots">' + dots + '</div>'
        + '<div class="row" style="gap:10px;margin-top:14px">'
        + '<button type="button" class="btn solid" style="height:34px" data-ban-ring>'
        + '<span>Ban the ' + bad + ' Flagged</span></button>'
        + '<button type="button" class="btn ghost" style="height:34px" data-ban-all>'
        + '<span>Block the Market</span></button></div>'
        + '<p style="margin-top:12px;font-size:12.5px" data-ban-note>Two ways to deal with a concentration. '
        + 'One of them costs you ' + (accts - bad) + ' clean accounts.</p>';
      var idots = detail.querySelectorAll('.acctdots i');
      detail.querySelector('[data-ban-ring]').addEventListener('click', function(){
        idots.forEach(function(el, i){
          setTimeout(function(){ if (i < bad) el.classList.add('gone'); }, rm ? 0 : 18 * i);
        });
        detail.querySelector('[data-ban-note]').innerHTML =
          '<b style="color:var(--ink)">' + bad + ' accounts removed.</b> The other ' + (accts - bad)
          + ' keep trading, and nobody else in ' + name + ' was touched.';
      });
      detail.querySelector('[data-ban-all]').addEventListener('click', function(){
        idots.forEach(function(el, i){
          setTimeout(function(){ el.classList.add('gone'); }, rm ? 0 : 8 * i);
        });
        detail.querySelector('[data-ban-note]').innerHTML =
          '<b style="color:#ffb4b4">' + accts + ' accounts removed to catch ' + bad + '.</b> '
          + (accts - bad) + ' of them had done nothing. This is what banning a market costs.';
      });
    };
    svg.addEventListener('mousemove', function(e){
      var t = e.target;
      if (t.tagName !== 'circle' || !t.dataset.o){ tip.hidden = true; return; }
      var a = act[t.dataset.o];
      if (!a){ tip.hidden = true; return; }
      tip.hidden = false;
      tip.textContent = a[0] + ': ' + a[2] + ' flagged of ' + a[1];
      var box = app.querySelector('.mapwrap').getBoundingClientRect();
      tip.style.left = (e.clientX - box.left + 14) + 'px';
      tip.style.top = (e.clientY - box.top - 8) + 'px';
    });
    svg.addEventListener('mouseleave', function(){ tip.hidden = true; });
    svg.addEventListener('click', function(e){
      var t = e.target;
      if (t.tagName === 'circle' && t.dataset.o && act[t.dataset.o]) openCountry(t.dataset.o);
    });
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        io.unobserve(app);
        ping(); setTimeout(ping, 900); setTimeout(ping, 1900);
        if (!rm) setInterval(ping, 3200);
      });
    }, {threshold:.2});
    io.observe(app);
  });

  // scenario tool: pick an abuse, see which layer catches it
  document.querySelectorAll('[data-scn-tool]').forEach(function(box){
    var data = JSON.parse(box.dataset.scnData), body = box.querySelector('[data-scn-body]');
    var VERD = [['Missed', 'var(--red)'], ['Caught', 'var(--grn)'], ['Partial', 'var(--amb)']];
    var paint = function(i){
      var d = data[i];
      body.innerHTML = '<h3 style="font-size:19px">' + d.t + '</h3>'
        + '<p style="margin-top:10px;font-size:14px">' + d.d + '</p>'
        + '<div style="margin-top:18px">' + d.rows.map(function(r){
            var v = VERD[r[1]];
            return '<div class="scnrow"><span class="scnv" style="color:' + v[1] + '">' + v[0] + '</span>'
              + '<span><b style="color:var(--ink);font-size:13.5px;font-weight:500">' + r[0] + '</b>'
              + '<span style="display:block;font-size:13px;color:var(--ink3);margin-top:3px">' + r[2]
              + '</span></span></div>';
          }).join('') + '</div>';
    };
    box.querySelectorAll('.scn').forEach(function(b, i){
      var go = function(){
        box.querySelectorAll('.scn').forEach(function(x){ x.classList.toggle('on', x === b); });
        paint(i);
      };
      b.addEventListener('click', go); b.addEventListener('mouseenter', go);
    });
    paint(0);
  });
  // set the dash length so the line draws rather than fades
  document.querySelectorAll('.spark path.line, .spark path.prior').forEach(function(pth){
    try { pth.style.setProperty('--len', Math.ceil(pth.getTotalLength())); } catch(e){}
  });
})();
