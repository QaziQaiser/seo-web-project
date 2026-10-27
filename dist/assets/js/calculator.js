/**
 * WEBSOL DIGITAL SOLUTIONS - WEBSITE COST CALCULATOR TOOL
 * Real-time calculation engine with dynamic sliders, addons, currency switcher,
 * itemized breakdown and interactive quote generation modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
});

function initCalculator() {
  // Elements
  const websiteTypeSelect = document.getElementById('calcWebsiteType');
  const copywritingSelect = document.getElementById('calcCopywriting');
  const seoTierSelect = document.getElementById('calcSeoTier');
  const pagesRange = document.getElementById('calcPagesRange');
  const pagesDisplay = document.getElementById('calcPagesDisplay');
  const productsRange = document.getElementById('calcProductsRange');
  const productsDisplay = document.getElementById('calcProductsDisplay');
  const addonPills = document.querySelectorAll('.addon-pill');
  const totalPriceElement = document.getElementById('calcTotalPrice');
  const currencySelect = document.getElementById('calcCurrencySelect');
  const currencySymbolElement = document.getElementById('calcCurrencySymbol');
  const toggleBreakdownBtn = document.getElementById('toggleBreakdownBtn');
  const breakdownDrawer = document.getElementById('calcBreakdownDrawer');
  const breakdownList = document.getElementById('breakdownItemsList');
  const calcForm = document.getElementById('calcSubmissionForm');
  const modalBackdrop = document.getElementById('calcEstimateModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalOkBtn = document.getElementById('modalOkBtn');
  const modalSummaryContent = document.getElementById('modalSummaryContent');

  if (!websiteTypeSelect || !totalPriceElement) return;

  // Currency Exchange Rates (Base: NZD)
  const currencies = {
    NZD: { symbol: '$', rate: 1.00, label: 'NZD' },
    USD: { symbol: '$', rate: 0.62, label: 'USD' },
    AUD: { symbol: '$', rate: 0.94, label: 'AUD' },
    GBP: { symbol: '£', rate: 0.48, label: 'GBP' },
    EUR: { symbol: '€', rate: 0.56, label: 'EUR' }
  };

  let currentCurrency = 'NZD';
  let previousTotal = 0;

  // Pricing Base Values in NZD
  const pricingData = {
    websiteTypes: {
      'choose': { name: 'None Selected', basePrice: 0, includedPages: 0 },
      'landing': { name: 'Landing Page / One-Pager', basePrice: 1300, includedPages: 1 },
      'standard': { name: 'Standard Business Website (5 Pages)', basePrice: 2250, includedPages: 5 },
      'ecommerce': { name: 'Custom eCommerce Online Store', basePrice: 3500, includedPages: 8 },
      'webapp': { name: 'Custom Web Application / Portal', basePrice: 4800, includedPages: 10 },
      'seo_growth': { name: 'SEO Growth & Website Redesign', basePrice: 1950, includedPages: 5 }
    },
    copywriting: {
      'choose': { name: 'None', price: 0 },
      'none': { name: 'Client Provides Copy', price: 0 },
      'polish': { name: 'Light Polish & Proofreading (5 pgs)', price: 250 },
      'seo_5': { name: 'Full SEO Copywriting (5 pgs)', price: 650 },
      'seo_10': { name: 'Full SEO Copywriting (10+ pgs)', price: 1200 },
      'premium': { name: 'Brand Storytelling & Conversion Copy', price: 1800 }
    },
    seoTiers: {
      'standard': { name: 'Essential On-Page SEO (Included)', price: 0 },
      'advanced': { name: 'Advanced Keyword & Tech Strategy', price: 450 },
      'local': { name: 'Local SEO & Google Domination', price: 650 },
      'monthly': { name: 'Full Monthly SEO Growth Package', price: 950 }
    },
    extraPageCost: 120,
    extraProductBatchCost: 80 // per 10 products
  };

  // Slider Event Listeners
  if (pagesRange && pagesDisplay) {
    pagesRange.addEventListener('input', () => {
      pagesDisplay.textContent = pagesRange.value;
      updateActivePreset('calcPagesRange', pagesRange.value);
      calculateTotal();
    });
  }

  if (productsRange && productsDisplay) {
    productsRange.addEventListener('input', () => {
      productsDisplay.textContent = productsRange.value;
      updateActivePreset('calcProductsRange', productsRange.value);
      calculateTotal();
    });
  }

  // Quick Preset Chips for Sliders
  const presetChips = document.querySelectorAll('.calc-preset-chip');
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const targetId = chip.getAttribute('data-target');
      const val = chip.getAttribute('data-value');
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.value = val;
        targetInput.dispatchEvent(new Event('input'));
      }
    });
  });

  function updateActivePreset(targetId, currentVal) {
    document.querySelectorAll(`.calc-preset-chip[data-target="${targetId}"]`).forEach(chip => {
      if (chip.getAttribute('data-value') === String(currentVal)) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // Dropdowns
  websiteTypeSelect.addEventListener('change', () => {
    // If eCommerce is selected, suggest default products if 0
    if (websiteTypeSelect.value === 'ecommerce' && productsRange && parseInt(productsRange.value) === 0) {
      productsRange.value = 15;
      productsDisplay.textContent = '15';
    }
    calculateTotal();
  });

  if (copywritingSelect) copywritingSelect.addEventListener('change', calculateTotal);
  if (seoTierSelect) seoTierSelect.addEventListener('change', calculateTotal);

  // Currency Selection
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      if (currencySymbolElement) {
        currencySymbolElement.textContent = currencies[currentCurrency].symbol;
      }
      calculateTotal();
    });
  }

  // Addon Pills Toggle
  addonPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      calculateTotal();
    });
  });

  // Breakdown Drawer Toggle
  if (toggleBreakdownBtn && breakdownDrawer) {
    toggleBreakdownBtn.addEventListener('click', () => {
      const isOpen = breakdownDrawer.classList.toggle('open');
      toggleBreakdownBtn.textContent = isOpen ? 'Hide Breakdown ▲' : 'View Breakdown ▼';
    });
  }

  // Calculation Function
  function calculateTotal() {
    const selectedWebTypeKey = websiteTypeSelect.value || 'choose';
    const webTypeData = pricingData.websiteTypes[selectedWebTypeKey] || pricingData.websiteTypes['choose'];
    
    const selectedCopyKey = copywritingSelect ? copywritingSelect.value : 'choose';
    const copyData = pricingData.copywriting[selectedCopyKey] || pricingData.copywriting['none'];

    const selectedSeoKey = seoTierSelect ? seoTierSelect.value : 'standard';
    const seoData = pricingData.seoTiers[selectedSeoKey] || pricingData.seoTiers['standard'];

    const pagesCount = pagesRange ? parseInt(pagesRange.value) : 0;
    const productsCount = productsRange ? parseInt(productsRange.value) : 0;

    // Calculate base and extras in NZD
    let nzdTotal = 0;
    const breakdownItems = [];

    // 1. Website Base
    if (webTypeData.basePrice > 0) {
      nzdTotal += webTypeData.basePrice;
      breakdownItems.push({ name: `Base Package: ${webTypeData.name}`, price: webTypeData.basePrice });
    }

    // 2. Extra Pages
    if (webTypeData.basePrice > 0 && pagesCount > webTypeData.includedPages) {
      const extraPages = pagesCount - webTypeData.includedPages;
      const extraPagesTotal = extraPages * pricingData.extraPageCost;
      nzdTotal += extraPagesTotal;
      breakdownItems.push({ name: `Extra Pages (${extraPages} × $${pricingData.extraPageCost})`, price: extraPagesTotal });
    } else if (webTypeData.basePrice === 0 && pagesCount > 0) {
      const pagesOnlyTotal = pagesCount * pricingData.extraPageCost;
      nzdTotal += pagesOnlyTotal;
      breakdownItems.push({ name: `Custom Pages (${pagesCount} pgs)`, price: pagesOnlyTotal });
    }

    // 3. Products
    if (productsCount > 0) {
      const batches = Math.ceil(productsCount / 10);
      const productsTotal = batches * pricingData.extraProductBatchCost;
      nzdTotal += productsTotal;
      breakdownItems.push({ name: `Products Setup (${productsCount} items)`, price: productsTotal });
    }

    // 4. Copywriting
    if (copyData.price > 0) {
      nzdTotal += copyData.price;
      breakdownItems.push({ name: `Copywriting: ${copyData.name}`, price: copyData.price });
    }

    // 5. SEO Tier
    if (seoData.price > 0) {
      nzdTotal += seoData.price;
      breakdownItems.push({ name: `SEO: ${seoData.name}`, price: seoData.price });
    }

    // 6. Selected Addons
    const activeAddons = document.querySelectorAll('.addon-pill.active');
    activeAddons.forEach(pill => {
      const addonName = pill.getAttribute('data-name') || pill.textContent.trim();
      const addonCost = parseFloat(pill.getAttribute('data-price')) || 0;
      if (addonCost > 0) {
        nzdTotal += addonCost;
        breakdownItems.push({ name: `Add-on: ${addonName}`, price: addonCost });
      } else {
        breakdownItems.push({ name: `Add-on: ${addonName}`, price: 0, isFree: true });
      }
    });

    // Currency Conversion
    const rate = currencies[currentCurrency].rate;
    const finalConvertedTotal = Math.round(nzdTotal * rate);

    // Render Price with Smooth Animation
    animatePrice(previousTotal, finalConvertedTotal);
    previousTotal = finalConvertedTotal;

    // Render Itemized Breakdown List
    renderBreakdown(breakdownItems, finalConvertedTotal);
  }

  // Smooth Price Number Ticker Animation
  function animatePrice(start, end) {
    const duration = 400;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);

      if (totalPriceElement) {
        totalPriceElement.textContent = current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (totalPriceElement) {
          totalPriceElement.textContent = end.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
    }

    requestAnimationFrame(update);
  }

  // Render Breakdown Drawer Items
  function renderBreakdown(items, finalTotal) {
    if (!breakdownList) return;
    if (items.length === 0) {
      breakdownList.innerHTML = '<div style="color: var(--slate-500); font-style: italic;">No items selected yet. Choose your website type and options above.</div>';
      return;
    }

    const rate = currencies[currentCurrency].rate;
    const symbol = currencies[currentCurrency].symbol;

    let html = '';
    items.forEach(item => {
      const convertedPrice = item.isFree ? 'FREE' : `${symbol}${Math.round(item.price * rate).toLocaleString()}`;
      html += `
        <div class="breakdown-item">
          <span>${item.name}</span>
          <span style="font-weight: 600; color: ${item.isFree ? 'var(--success)' : 'var(--slate-800)'}">${convertedPrice}</span>
        </div>
      `;
    });

    html += `
      <div class="breakdown-item">
        <span>Estimated Total (${currencies[currentCurrency].label})</span>
        <span>${symbol}${finalTotal.toLocaleString()} + GST</span>
      </div>
    `;

    breakdownList.innerHTML = html;
  }

  // Handle Calculator Contact Details Submission
  if (calcForm) {
    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('calcName')?.value.trim() || 'Client';
      const email = document.getElementById('calcEmail')?.value.trim();
      const phone = document.getElementById('calcPhone')?.value.trim();
      const comments = document.getElementById('calcComments')?.value.trim();
      const symbol = currencies[currentCurrency].symbol;
      const finalPrice = totalPriceElement.textContent;

      if (!name || !email) {
        alert('Please provide your name and email address so we can send you the official project proposal.');
        return;
      }

      // Generate Modal Proposal Summary
      if (modalSummaryContent) {
        const webTypeName = websiteTypeSelect.options[websiteTypeSelect.selectedIndex]?.text || 'Custom Website';
        const pagesCount = pagesRange ? pagesRange.value : '0';
        const activeAddonCount = document.querySelectorAll('.addon-pill.active').length;

        modalSummaryContent.innerHTML = `
          <div style="background: var(--slate-50); border-radius: 12px; padding: 18px; margin-bottom: 20px; border: 1px solid var(--border-color); text-align: left;">
            <p style="margin-bottom: 6px;"><strong>Client Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin-bottom: 6px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin-bottom: 6px;"><strong>Phone:</strong> ${phone ? escapeHtml(phone) : 'Not provided'}</p>
            <p style="margin-bottom: 6px;"><strong>Website Scope:</strong> ${webTypeName} (${pagesCount} Pages)</p>
            <p style="margin-bottom: 6px;"><strong>Selected Addons:</strong> ${activeAddonCount} Features Selected</p>
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--slate-200); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: var(--slate-900);">Estimated Project Value:</span>
              <span style="font-size: 1.3rem; font-weight: 800; color: var(--primary);">${symbol}${finalPrice} ${currencies[currentCurrency].label}</span>
            </div>
          </div>
          <p style="font-size: 0.95rem; color: var(--slate-600); margin-bottom: 24px;">
            We've recorded your project configuration. The WEBSOL Digital Solutions team will review your specifications and email you a full proposal with milestone breakdown within 24 business hours.
          </p>
        `;
      }

      // Open Modal
      if (modalBackdrop) {
        modalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      // Optional form reset
      calcForm.reset();
    });
  }

  // Modal Close Handlers
  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOkBtn) modalOkBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Helper function to escape HTML
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initial Calculation Run
  calculateTotal();
}
