// ── Page Navigation ──────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const map = { home: 'Home', scorer: 'Score SME', dashboard: 'Dashboard' };
  document.querySelectorAll('.nav-link').forEach(b => {
    if (b.textContent.trim() === map[id]) b.classList.add('active');
  });
  window.scrollTo(0, 0);
}

// ── Helpers ───────────────────────────────────────────────
function barColor(v) {
  if (v >= 70) return '#1D9E75';
  if (v >= 45) return '#BA7517';
  return '#A32D2D';
}

function verdictStyle(v) {
  const map = {
    'Approved':               { bg: '#E1F5EE', color: '#085041' },
    'Conditionally Approved': { bg: '#FAEEDA', color: '#633806' },
    'Under Review':           { bg: '#FAEEDA', color: '#633806' },
    'Rejected':               { bg: '#FCEBEB', color: '#791F1F' },
  };
  return map[v] || { bg: '#F1EFE8', color: '#444441' };
}

function scoreStyle(score) {
  if (score >= 700) return { border: '#1D9E75', bg: '#E1F5EE', text: '#085041' };
  if (score >= 550) return { border: '#BA7517', bg: '#FAEEDA', text: '#633806' };
  return { border: '#A32D2D', bg: '#FCEBEB', text: '#791F1F' };
}

function setBar(id, numId, value) {
  const bar = document.getElementById(id);
  const num = document.getElementById(numId);
  if (bar) { bar.style.width = value + '%'; bar.style.background = barColor(value); }
  if (num) num.textContent = value;
}

// ── States ────────────────────────────────────────────────
function showState(state) {
  ['result-placeholder', 'result-loading', 'result-output', 'result-error']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  const target = document.getElementById('result-' + state);
  if (target) target.style.display = 'block';
}

function clearForm() {
  ['f-name','f-industry','f-years','f-revenue','f-expenses','f-loans','f-gst','f-rating','f-loan']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = el.tagName === 'SELECT' ? el.options[0].value : '';
    });
  showState('placeholder');
}

function clearError() { showState('placeholder'); }

// ── Main scoring function ──────────────────────────────────
async function scoreNow() {
  const btn = document.getElementById('score-btn');

  const data = {
    businessName: document.getElementById('f-name').value,
    industry:     document.getElementById('f-industry').value,
    years:        document.getElementById('f-years').value,
    revenue:      parseFloat(document.getElementById('f-revenue').value) || 0,
    expenses:     parseFloat(document.getElementById('f-expenses').value) || 0,
    loans:        document.getElementById('f-loans').value,
    gst:          document.getElementById('f-gst').value,
    rating:       document.getElementById('f-rating').value,
    loanAmount:   parseFloat(document.getElementById('f-loan').value) || 0,
  };

  if (!data.industry || !data.revenue) {
    document.getElementById('error-msg').textContent = 'Please fill in at least the Industry and Monthly Revenue fields.';
    showState('error');
    return;
  }

  btn.disabled = true;
  showState('loading');

  try {
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Server error');
    }

    const result = await response.json();
    renderResult(result, data.businessName);

  } catch (err) {
    document.getElementById('error-msg').textContent =
      err.message || 'Something went wrong. Please try again.';
    showState('error');
  } finally {
    btn.disabled = false;
  }
}

// ── Render result ─────────────────────────────────────────
function renderResult(r, name) {
  const ss = scoreStyle(r.score);
  const vs = verdictStyle(r.verdict);

  // Score ring
  const ring = document.getElementById('r-ring');
  ring.style.borderColor  = ss.border;
  ring.style.background   = ss.bg;
  document.getElementById('r-score').style.color = ss.text;
  document.getElementById('r-grade').style.color = ss.text;
  document.getElementById('r-score').textContent = r.score;
  document.getElementById('r-grade').textContent = r.grade;

  // Verdict badge
  const badge = document.getElementById('r-verdict-badge');
  badge.textContent         = r.verdict;
  badge.style.background    = vs.bg;
  badge.style.color         = vs.color;

  // Meta
  document.getElementById('r-maxloan').textContent =
    '₹' + (r.max_recommended_loan || 0).toLocaleString('en-IN');
  document.getElementById('r-rate').textContent = r.interest_rate_band || '—';

  // Bars
  setBar('b-cashflow',   'n-cashflow',   r.cashflow_score   || 0);
  setBar('b-compliance', 'n-compliance', r.compliance_score || 0);
  setBar('b-reputation', 'n-reputation', r.reputation_score || 0);
  setBar('b-stability',  'n-stability',  r.stability_score  || 0);

  // Strengths
  const str = document.getElementById('r-strengths');
  str.innerHTML = (r.strengths || [])
    .map(s => `<div class="sr-item">+ ${s}</div>`)
    .join('');

  // Risks
  const risk = document.getElementById('r-risks');
  risk.innerHTML = (r.risks || [])
    .map(s => `<div class="sr-item">- ${s}</div>`)
    .join('');

  // Summary
  document.getElementById('r-summary').textContent = r.summary || '';

  showState('output');
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showState('placeholder');
});
