/* WEBSOL Website Price Estimator Interactive Engine */
(function () {
      'use strict';

      /*PRICING_START*/
      var PRICING = {
        type: {
          business: { base: 300 }, store: { base: 700 }, blog: { base: 250 },
          portfolio: { base: 250 }, booking: { base: 450 }, custom: { base: 800 },
          notsure: { base: 300 }
        },
        design: { simple: 0, modern: 120, creative: 200, premium: 350, custom: 600 },
        pages: { p5: 0, p10: 150, p20: 350, p20plus: 650, unsure: 150 },
        content: { ready: 0, some: 90, help: 250 },
        seo: { none: 0, basic: 80, full: 280 },
        features: {
          contact: 40, booking: 180, payments: 200, catalogue: 150, reviews: 60,
          gallery: 70, blog: 90, accounts: 220, chat: 50, maps: 30, search: 80, seo: 0
        },
        included: {
          business: ['contact'], store: ['catalogue', 'payments', 'contact'], blog: ['blog'],
          portfolio: ['gallery', 'contact'], booking: ['booking', 'contact'], custom: [],
          notsure: ['contact']
        },
        min: 200,
        max: 3000
      };
      function roundTo10(n) { return Math.round(n / 10) * 10; }
      function calcEstimate(s) {
        s = s || {};
        var P = PRICING;
        var feats = s.features || [];
        var inc = P.included[s.type] || [];
        var base = P.type[s.type] ? P.type[s.type].base : 0;
        var featCost = 0, paid = [], free = [];
        feats.forEach(function (f) {
          if (!Object.prototype.hasOwnProperty.call(P.features, f)) { return; }
          if (inc.indexOf(f) > -1) { free.push(f); } else { paid.push(f); featCost += P.features[f]; }
        });
        var seoLevel = 'none';
        if (s.seo === 'full') { seoLevel = 'full'; }
        else if (s.seo === 'basic' || feats.indexOf('seo') > -1) { seoLevel = 'basic'; }
        var raw = {
          design: P.design[s.design] || 0,
          development: base + (P.pages[s.pages] || 0),
          features: featCost,
          content: P.content[s.content] || 0,
          seo: P.seo[seoLevel]
        };
        var keys = ['design', 'development', 'features', 'content', 'seo'];
        var rawTotal = 0;
        keys.forEach(function (k) { rawTotal += raw[k]; });
        var capped = rawTotal > P.max, floored = rawTotal < P.min;
        var clamped = Math.min(Math.max(rawTotal, P.min), P.max);
        var total = Math.min(Math.max(roundTo10(clamped), P.min), P.max);
        var parts = {}, used = 0, big = 'development';
        keys.forEach(function (k) { parts[k] = 0; });
        if (rawTotal > 0) {
          var f = total / rawTotal;
          keys.forEach(function (k) {
            parts[k] = Math.floor(raw[k] * f + 1e-9);
            used += parts[k];
            if (raw[k] > raw[big]) { big = k; }
          });
        }
        parts[big] += total - used;
        var low = Math.max(P.min, roundTo10(total * 0.9));
        var high = Math.min(P.max, roundTo10(total * 1.12));
        if (low > total) { low = total; }
        if (high < total) { high = total; }
        return {
          total: total, low: low, high: high, parts: parts, raw: raw, rawTotal: rawTotal,
          capped: capped, floored: floored, seoLevel: seoLevel, paid: paid, free: free, included: inc
        };
      }
      /*PRICING_END*/

      var ICONS = {
        briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
        cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11l2-8H6"/>',
        doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
        image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 9"/>',
        calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
        sliders: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
        help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
        mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
        card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
        box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
        star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
        chat: '<path d="M4 5h16v11H9l-5 4z"/>',
        pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
        search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
        trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
        clean: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 9v11"/>',
        spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
        palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-6-4-11-8-11z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>',
        gem: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l-2 5 5 11 5-11-2-5"/>',
        pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>'
      };

      var TYPES = [
        { id: 'business', title: 'Business Website', desc: 'Introduce your business, explain your services, and help customers get in touch.', icon: 'briefcase' },
        { id: 'store', title: 'Online Store', desc: 'Display products and allow customers to shop online.', icon: 'cart' },
        { id: 'blog', title: 'Blog or Information Website', desc: 'Publish articles, guides, news, or helpful information.', icon: 'doc' },
        { id: 'portfolio', title: 'Portfolio Website', desc: 'Showcase your work, projects, experience, and achievements.', icon: 'image' },
        { id: 'booking', title: 'Booking Website', desc: 'Allow visitors to request appointments or book services.', icon: 'calendar' },
        { id: 'custom', title: 'Custom Website', desc: 'Build a website around a more specific idea or business requirement.', icon: 'sliders' },
        { id: 'notsure', title: 'Not Sure', desc: 'Not certain yet? Pick this and get simple guidance on a good starting point.', icon: 'help' }
      ];
      var DESIGNS = [
        { id: 'simple', title: 'Simple and Clean', desc: 'A straightforward layout with clear information and easy navigation.', icon: 'clean', tag: 'Lowest design cost' },
        { id: 'modern', title: 'Modern and Professional', desc: 'A polished design suitable for businesses and professional services.', icon: 'spark', tag: 'Low design cost' },
        { id: 'creative', title: 'Creative and Colourful', desc: 'A distinctive visual style for brands, portfolios, and creative projects.', icon: 'palette', tag: 'Medium design cost' },
        { id: 'premium', title: 'Premium and Elegant', desc: 'A refined look with carefully selected typography, spacing, and imagery.', icon: 'gem', tag: 'Higher design cost' },
        { id: 'custom', title: 'Custom Design', desc: 'A more tailored design based on your preferences.', icon: 'pen', tag: 'Highest design cost' }
      ];
      var FEATURES = [
        { id: 'contact', title: 'Contact Form', desc: 'Help visitors send enquiries.', icon: 'mail' },
        { id: 'booking', title: 'Online Booking', desc: 'Allow visitors to request appointments or reserve services.', icon: 'calendar', ext: true },
        { id: 'payments', title: 'Online Payments', desc: 'Accept payments through an appropriate payment provider.', icon: 'card', ext: true },
        { id: 'catalogue', title: 'Product Catalogue', desc: 'Display products with images and descriptions.', icon: 'box' },
        { id: 'reviews', title: 'Customer Reviews', desc: 'Show testimonials and customer feedback.', icon: 'star' },
        { id: 'gallery', title: 'Image Gallery', desc: 'Present photographs, projects, or completed work.', icon: 'image' },
        { id: 'blog', title: 'Blog or Article Section', desc: 'Publish useful written content.', icon: 'doc' },
        { id: 'accounts', title: 'Customer Accounts', desc: 'Allow users to register and access personalised features.', icon: 'user', ext: true },
        { id: 'chat', title: 'Live Chat', desc: 'Offer a way for visitors to communicate with the business.', icon: 'chat', ext: true },
        { id: 'maps', title: 'Google Maps Integration', desc: 'Help visitors find a business location.', icon: 'pin', ext: true },
        { id: 'search', title: 'Search Function', desc: 'Help visitors find content or products.', icon: 'search' },
        { id: 'seo', title: 'Basic SEO Setup', desc: 'Include foundational on-page SEO elements such as page titles, meta descriptions, and a sensible heading structure.', icon: 'trend', seo: true }
      ];
      var QUESTIONS = [
        {
          name: 'pages', legend: 'How Many Pages Do You Need?', req: true,
          help: 'A page is a separate screen such as Home, About, Services or Contact. Many small business websites use 5 to 10. If you are not sure, we assume 6 to 10 pages.',
          opts: [['p5', '1 to 5 pages'], ['p10', '6 to 10 pages'], ['p20', '11 to 20 pages'], ['p20plus', 'More than 20 pages'], ['unsure', "I'm not sure"]]
        },
        {
          name: 'domain', legend: 'Do You Already Have a Domain Name?',
          help: 'Your domain is your web address. Registering one is a separate cost, so this answer does not change the estimate.',
          opts: [['yes', 'Yes'], ['no', 'No'], ['unsure', "I'm not sure"]]
        },
        {
          name: 'content', legend: 'Is Your Website Content Ready?', req: true,
          help: 'Content means the text, photos and logo that go on your pages. Preparing it takes time, so it can affect the cost.',
          opts: [['ready', 'Yes, I have my content ready.'], ['some', 'I have some content.'], ['help', 'I need help preparing my content.']]
        },
        {
          name: 'seo', legend: 'Do You Need Help With Search Engine Optimisation?', req: true,
          help: 'SEO helps search engines understand your pages. Basic SEO covers titles, descriptions and headings. Choose "Not sure yet" if you would rather decide later.',
          opts: [['basic', 'Basic SEO'], ['full', 'More comprehensive SEO assistance'], ['unsure', 'Not sure yet']]
        },
        {
          name: 'timeline', legend: 'How Soon Would You Like Your Website?',
          help: 'This is for planning only. The estimator does not add rush charges.',
          opts: [['asap', 'As soon as reasonably possible'], ['weeks', 'Within a few weeks'], ['flexible', 'I am flexible']]
        }
      ];
      var HELPERS = [
        ['I want to sell products online', 'store'], ['I want customers to contact me', 'business'],
        ['I want people to book appointments', 'booking'], ['I want to share articles or guides', 'blog'],
        ['I want to show my work', 'portfolio'], ['Something more specific', 'custom']
      ];
      var STEPS = ['Website Type', 'Design', 'Features', 'Details', 'Summary', 'Estimate'];
      var EXAMPLE = [['yes', 'Yes, I have an example.'], ['no', 'No, help me choose.']];

      function $(s, r) { return (r || document).querySelector(s); }
      function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
      function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
      function money(n) { return 'NZ$' + Number(n).toLocaleString('en-NZ'); }
      function find(list, id) { for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } } return null; }
      function qLabel(name, val) { var q = QUESTIONS.filter(function (x) { return x.name === name; })[0]; if (!q) { return ''; } for (var i = 0; i < q.opts.length; i++) { if (q.opts[i][0] === val) { return q.opts[i][1]; } } return ''; }
      function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[n] || '') + '</svg>'; }
      function niceList(a) { if (a.length < 2) { return a.join(''); } return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      var form = $('#calcForm'), current = 1;

      /* render options */
      function card(kind, name, it, extra) {
        return '<label class="opt"><input type="' + kind + '" name="' + name + '" value="' + it.id + '"' + (extra || '') + '>' +
          '<span class="opt-body"><span class="opt-ic">' + icon(it.icon) + '</span><span class="opt-t">' + it.title + '</span>' +
          '<span class="opt-d">' + it.desc + '</span>' +
          (it.tag ? '<span class="opt-tag">' + it.tag + '</span>' : '') +
          (it.ext ? '<span class="opt-tag">Third-party fees may apply</span>' : '') +
          (it.seo ? '<span class="opt-tag">Priced under SEO setup</span>' : '') +
          (kind === 'checkbox' ? '<span class="opt-tag inc" hidden>Included with your website type</span>' : '') +
          '</span></label>';
      }
      $('#typeList').insertAdjacentHTML('beforeend', TYPES.map(function (t) { return card('radio', 'type', t); }).join(''));
      $('#designList').insertAdjacentHTML('beforeend', DESIGNS.map(function (d) { return card('radio', 'design', d); }).join(''));
      $('#featureList').insertAdjacentHTML('beforeend', FEATURES.map(function (t) { return card('checkbox', 'feature', t, ' data-user="0"'); }).join(''));
      function pills(name, opts) {
        return opts.map(function (o) { return '<label class="pill"><input type="radio" name="' + name + '" value="' + o[0] + '"><span>' + esc(o[1]) + '</span></label>'; }).join('');
      }
      $('#exampleList').innerHTML = pills('example', EXAMPLE);
      $('#detailQs').innerHTML = QUESTIONS.map(function (q) {
        return '<fieldset class="q"><legend>' + q.legend + (q.req ? '' : ' <span style="font-weight:400;color:var(--muted)">(optional)</span>') + '</legend><p class="help">' + q.help + '</p><div class="pills">' + pills(q.name, q.opts) + '</div></fieldset>';
      }).join('');
      $('#helperBtns').innerHTML = HELPERS.map(function (h) { return '<button type="button" data-helper="' + h[1] + '">' + h[0] + '</button>'; }).join('');
      $('#progress').innerHTML = STEPS.map(function (s, i) {
        return '<li><button type="button" class="pstep" data-pstep="' + (i + 1) + '"><span class="n">' + (i + 1) + '</span><span class="lbl">' + s + '</span></button></li>';
      }).join('');

      /* state */
      function getState() {
        var fd = new FormData(form), s = {};
        ['type', 'design', 'example', 'pages', 'domain', 'content', 'seo', 'timeline'].forEach(function (k) { s[k] = fd.get(k) || ''; });
        s.features = fd.getAll('feature');
        return s;
      }
      function syncIncluded() {
        var type = ($('input[name="type"]:checked') || {}).value;
        var inc = PRICING.included[type] || [];
        $$('input[name="feature"]').forEach(function (cb) {
          var isInc = inc.indexOf(cb.value) > -1;
          cb.disabled = isInc;
          cb.checked = isInc ? true : cb.getAttribute('data-user') === '1';
          var lab = cb.closest('.opt');
          lab.classList.toggle('is-included', isInc);
          $('.inc', lab).hidden = !isInc;
        });
      }
      function updateLive() {
        var s = getState(), box = $('#liveBox');
        if (!s.type) { box.textContent = 'Choose a website type to see a live estimate'; return; }
        var e = calcEstimate(s);
        box.innerHTML = 'Estimate so far: <b>' + money(e.total) + '</b>';
      }

      /* navigation */
      function validate(step, s) {
        var m = [];
        if (step === 1 && !s.type) { m.push('Please choose a website type to continue. If you are unsure, pick Not Sure and use the quick guide.'); }
        if (step === 2 && !s.design) { m.push('Please choose a design style to continue. Custom Design is there if nothing else fits.'); }
        if (step === 4) {
          var miss = [];
          if (!s.pages) { miss.push('the number of pages'); }
          if (!s.content) { miss.push('your content'); }
          if (!s.seo) { miss.push('SEO help'); }
          if (miss.length) { m.push('Almost there. Please answer the questions about ' + niceList(miss) + ' so the estimate is fair. The "not sure" options are fine.'); }
        }
        return m;
      }
      function showMsg(t) { var el = $('#stepMsg'); if (t) { el.textContent = t; el.hidden = false; } else { el.textContent = ''; el.hidden = true; } }
      function goTo(n, silent) {
        current = Math.max(1, Math.min(6, n));
        $$('.step').forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== current; });
        $$('.pstep').forEach(function (b) {
          var i = Number(b.getAttribute('data-pstep'));
          b.classList.toggle('done', i < current);
          if (i === current) { b.setAttribute('aria-current', 'step'); } else { b.removeAttribute('aria-current'); }
        });
        $('#pfill').style.width = ((current - 1) / 5 * 100) + '%';
        $('#stepLine').textContent = 'Step ' + current + ' of 6: ' + STEPS[current - 1];
        $('#backBtn').style.visibility = current === 1 ? 'hidden' : 'visible';
        var nb = $('#nextBtn');
        nb.hidden = current === 6;
        nb.textContent = current === 5 ? 'See My Estimate' : 'Next';
        $('#liveBox').hidden = current === 6;
        if (current === 5) { renderSummary(); }
        if (current === 6) { renderEstimate(); }
        showMsg('');
        if (!silent) {
          $('#estimator').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          var h = $('#t' + current);
          if (h) { h.focus({ preventScroll: true }); }
        }
      }
      function tryGo(target) {
        var s = getState();
        if (target <= current) { goTo(target); return; }
        for (var i = current; i < target; i++) {
          var errs = validate(i, s);
          if (errs.length) { goTo(i); showMsg(errs[0]); return; }
        }
        goTo(target);
      }

      /* summary and estimate */
      function featureNames(ids) { return ids.map(function (id) { return find(FEATURES, id).title; }); }
      function summaryRows(s) {
        var e = calcEstimate(s), t = find(TYPES, s.type), d = find(DESIGNS, s.design);
        var chosen = featureNames(e.paid);
        var incl = featureNames(e.included);
        var feat = (chosen.length ? chosen.join(', ') : 'No extra features selected') + (incl.length ? '. Included with your type: ' + incl.join(', ') : '');
        var pagesNote = s.pages === 'unsure' ? ' (priced as 6 to 10 pages)' : '';
        return [
          ['Website type', t ? t.title + (t.id === 'notsure' ? ' (priced as a Business Website)' : '') : 'Not chosen', 1],
          ['Preferred design', (d ? d.title : 'Not chosen') + (s.example ? '. Design example: ' + (s.example === 'yes' ? 'Yes, I have one' : 'No, I would like help choosing') : ''), 2],
          ['Selected features', feat, 3],
          ['Number of pages', (qLabel('pages', s.pages) || 'Not answered') + pagesNote, 4],
          ['Content requirements', qLabel('content', s.content) || 'Not answered', 4],
          ['SEO preferences', (qLabel('seo', s.seo) || 'Not answered') + (s.features.indexOf('seo') > -1 && s.seo !== 'full' ? '. Basic SEO Setup feature selected' : ''), 4],
          ['Domain status', qLabel('domain', s.domain) || 'Not specified', 4],
          ['Desired timeline', qLabel('timeline', s.timeline) || 'Not specified', 4]
        ];
      }
      function renderSummary() {
        var s = getState();
        $('#summaryList').innerHTML = summaryRows(s).map(function (r) {
          return '<li><div><div class="k">' + r[0] + '</div><div class="v">' + esc(r[1]) + '</div></div><button type="button" data-goto="' + r[2] + '" aria-label="Edit ' + r[0].toLowerCase() + '">Edit</button></li>';
        }).join('');
        var e = calcEstimate(s);
        $('#prelim').innerHTML = '<span>Preliminary price range</span><strong>' + money(e.low) + ' to ' + money(e.high) + '</strong><p>This range is indicative and depends on the final project scope. It is not a quote. The full breakdown comes next.</p>';
      }
      var PART_LABELS = [
        ['design', 'Design'], ['development', 'Development'], ['features', 'Additional features'],
        ['content', 'Content preparation'], ['seo', 'SEO setup']
      ];
      function partNote(key) {
        return { design: 'Included, no extra design charge', features: 'None selected, optional', content: 'Not needed', seo: 'Not included, optional', development: '' }[key];
      }
      function reportBody(s, e) {
        var rows = summaryRows(s);
        var date = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
        var h = '<h1>Website Cost Estimate (NZD)</h1><p>Prepared on ' + esc(date) + ' using Website Price Estimator NZ.</p>';
        h += '<h2>Estimated price: ' + money(e.total) + '</h2><p>Likely range: ' + money(e.low) + ' to ' + money(e.high) + '</p>';
        if (e.capped) { h += '<p>The calculated total reached the NZ$3,000 limit of this estimator. Complex projects may need a separate assessment.</p>'; }
        h += '<h3>Your requirements</h3><table>' + rows.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>';
        h += '<h3>Cost breakdown</h3><table>' + PART_LABELS.map(function (p) {
          var v = e.parts[p[0]];
          return '<tr><th>' + p[1] + '</th><td>' + (v > 0 ? money(v) : esc(partNote(p[0]))) + '</td></tr>';
        }).join('') + '<tr><th>Total estimate</th><td><strong>' + money(e.total) + '</strong></td></tr></table>';
        h += '<h3>Important notes</h3><ul><li>This is an indicative estimate, not a quote.</li><li>Domain registration, hosting, premium plugins, payment processing, third-party subscriptions, taxes such as GST, and ongoing maintenance may cost extra.</li><li>Not every project needs every service.</li><li>The estimate is limited to the range NZ$200 to NZ$3,000.</li></ul>';
        return h;
      }
      function renderEstimate() {
        var s = getState(), e = calcEstimate(s);
        var h = '<div class="result"><div class="result-card"><span class="lab">Estimated website cost</span><span class="big">' + money(e.total) + '</span><span class="rng">Likely range: ' + money(e.low) + ' to ' + money(e.high) + '</span>';
        h += '<p class="note">' + (e.capped ? 'Your selections add up to more than the NZ$3,000 this estimator can show, so the total is capped at NZ$3,000. A project this size may need a separate assessment.' : (e.floored ? 'The calculated total was below the NZ$200 minimum, so the minimum is shown.' : 'Rounded to the nearest NZ$10. Real quotes vary by provider and project details.')) + '</p></div></div>';
        h += '<table class="bd"><caption>Estimated cost breakdown</caption><tbody>';
        PART_LABELS.forEach(function (p) {
          var v = e.parts[p[0]];
          h += '<tr><th scope="row">' + p[1] + '</th>' + (v > 0 ? '<td>' + money(v) + '</td>' : '<td class="opt-note">' + esc(partNote(p[0])) + '</td>') + '</tr>';
        });
        h += '</tbody><tfoot><tr><th scope="row">Total estimate</th><td>' + money(e.total) + '</td></tr></tfoot></table>';
        var incl = featureNames(e.included);
        if (incl.length) { h += '<p class="callout">Already included with your website type and not charged again: ' + esc(incl.join(', ')) + '.</p>'; }
        h += '<ul class="dis"><li>This is an indicative estimate, not a quote or a guaranteed price.</li><li>Domain registration, hosting, premium plugins, payment processing, third-party subscriptions, taxes such as GST, and ongoing maintenance may incur separate charges.</li><li>Not every project needs every service, so items you did not select are shown as optional or not included.</li></ul>';
        h += '<div class="actions"><button type="button" class="btn btn-ghost" id="editBtn">Edit My Choices</button><button type="button" class="btn btn-primary" id="dlBtn">Download My Estimate</button><button type="button" class="btn btn-ghost" id="printBtn">Print My Estimate</button></div><p class="status" id="dlStatus" role="status"></p>';
        $('#estimateBody').innerHTML = h;
      }
      function download() {
        var s = getState(), e = calcEstimate(s), st = $('#dlStatus');
        var css = 'body{font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:30px auto;padding:0 18px;color:#0F172A;line-height:1.5}h1{color:#0B132B}h2{color:#0066FF}table{width:100%;border-collapse:collapse;margin-bottom:18px}th,td{text-align:left;padding:8px;border-bottom:1px solid #E2E8F0;vertical-align:top}th{width:38%;color:#0B132B}@media print{.np{display:none}}';
        var html = '<!DOCTYPE html><html lang="en-NZ"><head><meta charset="utf-8"><title>Website Cost Estimate NZ</title><style>' + css + '</style></head><body>' + reportBody(s, e) + '<p class="np"><button onclick="window.print()">Print this estimate</button></p></body></html>';
        try {
          var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          var url = URL.createObjectURL(blob), a = document.createElement('a');
          a.href = url; a.download = 'website-cost-estimate-nz.html';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
          st.textContent = 'Your estimate was saved as an HTML file. Open it in your browser to read it, or print it or save it as a PDF from there.';
        } catch (err) {
          st.textContent = 'Downloading is not available in this browser, so the print window has opened instead.';
          printReport();
        }
      }
      function printReport() {
        var s = getState(), e = calcEstimate(s);
        $('#printArea').innerHTML = reportBody(s, e);
        window.print();
      }
      window.addEventListener('afterprint', function () { $('#printArea').innerHTML = ''; });
      function resetAll() {
        form.reset();
        $$('input[name="feature"]').forEach(function (cb) { cb.setAttribute('data-user', '0'); });
        syncIncluded(); updateLive(); $('#typeHelper').hidden = true;
        goTo(1);
      }

      /* events */
      form.addEventListener('change', function (ev) {
        var t = ev.target;
        if (t.name === 'feature') { t.setAttribute('data-user', t.checked ? '1' : '0'); }
        if (t.name === 'type') { $('#typeHelper').hidden = t.value !== 'notsure'; }
        syncIncluded(); updateLive(); showMsg('');
      });
      $('#nextBtn').addEventListener('click', function () { tryGo(current + 1); });
      $('#backBtn').addEventListener('click', function () { goTo(current - 1); });
      $('#resetBtn').addEventListener('click', resetAll);
      document.addEventListener('click', function (ev) {
        var el = ev.target.closest ? ev.target.closest('button, a') : null;
        if (!el) { return; }
        if (el.hasAttribute('data-pstep')) { tryGo(Number(el.getAttribute('data-pstep'))); }
        else if (el.hasAttribute('data-goto')) { goTo(Number(el.getAttribute('data-goto'))); }
        else if (el.hasAttribute('data-helper')) {
          var r = $('input[name="type"][value="' + el.getAttribute('data-helper') + '"]');
          if (r) { r.checked = true; $('#typeHelper').hidden = true; syncIncluded(); updateLive(); showMsg(''); }
        }
        else if (el.id === 'editBtn') { goTo(1); }
        else if (el.id === 'dlBtn') { download(); }
        else if (el.id === 'printBtn') { printReport(); }
        else if (el.id === 'againBtn') { resetAll(); }
        else if (el.id === 'ctaStart') {
          ev.preventDefault();
          $('#estimator').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          $('#calcTitle').focus({ preventScroll: true });
        }
      });

      /* methodology tables, built from the same numbers the calculator uses */
      function tbl(cap, rows) {
        return '<div class="tw"><table><caption>' + cap + '</caption><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td>' + (r[2] !== undefined ? '<td>' + r[2] + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>';
      }
      function renderModel() {
        var P = PRICING, h = '';
        h += tbl('Starting amount by website type', TYPES.map(function (t) { return [t.title, money(P.type[t.id].base), t.id === 'notsure' ? 'Priced as a Business Website' : '']; }));
        h += tbl('Design style', DESIGNS.map(function (d) { return [d.title, P.design[d.id] ? '+ ' + money(P.design[d.id]) : 'No extra charge']; }));
        h += tbl('Number of pages', QUESTIONS[0].opts.map(function (o) { return [o[1], P.pages[o[0]] ? '+ ' + money(P.pages[o[0]]) : 'No extra charge']; }));
        h += tbl('Content preparation', QUESTIONS[2].opts.map(function (o) { return [o[1], P.content[o[0]] ? '+ ' + money(P.content[o[0]]) : 'No extra charge']; }));
        h += tbl('SEO setup', [['Basic SEO, or the Basic SEO Setup feature', '+ ' + money(P.seo.basic)], ['More comprehensive SEO assistance', '+ ' + money(P.seo.full)], ['Not sure yet, with no SEO feature selected', 'Not included']]);
        h += tbl('Additional features (not charged if already included with your website type)', FEATURES.filter(function (f) { return !f.seo; }).map(function (f) {
          var inWhich = TYPES.filter(function (t) { return P.included[t.id].indexOf(f.id) > -1 && t.id !== 'notsure'; }).map(function (t) { return t.title; });
          return [f.title, '+ ' + money(P.features[f.id]), inWhich.length ? 'Included with: ' + inWhich.join(', ') : ''];
        }));
        $('#modelTables').innerHTML = h;
      }

      /* 3D hero tilt */
      (function () {
        var scene = $('#scene'), stack = $('#stack');
        if (!scene || !stack || reduce) { return; }
        scene.addEventListener('pointermove', function (ev) {
          var r = scene.getBoundingClientRect();
          var x = ((ev.clientX - r.left) / r.width - 0.5) * 2, y = ((ev.clientY - r.top) / r.height - 0.5) * 2;
          stack.style.setProperty('--ry', x.toFixed(3));
          stack.style.setProperty('--rx', y.toFixed(3));
        });
        scene.addEventListener('pointerleave', function () { stack.style.setProperty('--ry', 0); stack.style.setProperty('--rx', 0); });
      })();

      renderModel();
      syncIncluded();
      updateLive();
      goTo(1, true);
    })();
