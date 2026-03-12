(function () {
  'use strict';

  // All ZIP codes serviced by Johnson's Electric of Charlotte
  var SERVICE_ZIPS = [
    // Charlotte proper / Mecklenburg County
    '28201','28202','28203','28204','28205','28206','28207','28208','28209','28210',
    '28211','28212','28213','28214','28215','28216','28217','28218','28219','28220',
    '28221','28222','28223','28224','28225','28226','28227','28228','28229','28230',
    '28231','28232','28233','28234','28235','28236','28237','28241','28242','28243',
    '28244','28246','28247','28250','28251','28252','28253','28254','28255','28256',
    '28258','28260','28262','28263','28265','28266','28269','28270','28271','28272',
    '28273','28274','28275','28277','28278','28280','28281','28282','28283','28284',
    '28285','28286','28287','28288','28289','28290','28296','28297','28299',
    // Huntersville / North Mecklenburg
    '28078',
    // Matthews / Southeast Mecklenburg
    '28104','28105',
    // Concord / Kannapolis (Cabarrus County)
    '28025','28026','28027','28081','28082','28083',
    // Mooresville / Davidson / Cornelius (Iredell / North Meck)
    '28031','28036','28115',
    // Gastonia / Belmont (Gaston County)
    '28052','28053','28054','28056','28012',
    // Pineville
    '28134',
    // Indian Trail / Stallings / Monroe (Union County)
    '28079','28104','28110',
    // Fort Mill / Rock Hill, SC (York County)
    '29708','29709','29710','29715','29730','29731','29732','29733',
    // Mint Hill
    '28227'
  ];

  function init() {
    var btn = document.getElementById('zip-check-btn');
    var input = document.getElementById('zip-input');
    var resultEl = document.getElementById('zip-result-msg');

    if (!btn || !input || !resultEl) return;

    function checkZip() {
      var zip = input.value.trim();

      // Reset state
      resultEl.className = 'sa-zip-result-msg';
      resultEl.innerHTML = '';

      if (!/^\d{5}$/.test(zip)) {
        resultEl.classList.add('show', 'error');
        resultEl.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
          '<span>Please enter a valid 5-digit zip code.</span>';
        return;
      }

      if (SERVICE_ZIPS.indexOf(zip) !== -1) {
        resultEl.classList.add('show', 'success');
        resultEl.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
          '<span>Great news! We service zip code <strong>' + zip + '</strong>. <a href="/contact/">Schedule your appointment today.</a></span>';
      } else {
        resultEl.classList.add('show', 'outside');
        resultEl.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
          '<span>Zip code <strong>' + zip + '</strong> isn\'t in our standard list, but we may still be able to help! <a href="/contact/">Reach out to us</a> and we\'ll confirm if we can serve your area.</span>';
      }
    }

    btn.addEventListener('click', checkZip);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') checkZip();
    });

    // Only allow digits
    input.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
