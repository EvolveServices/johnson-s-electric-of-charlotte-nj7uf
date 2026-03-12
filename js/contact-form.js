/* === Contact Page — Multi-Step Form Logic === */

(function () {
  var TOTAL_STEPS = 7;
  var currentStep = 1;

  // ── DOM refs ──
  var form = document.getElementById('service-request-form');
  var successState = document.getElementById('form-success-state');
  var currentStepNum = document.getElementById('current-step-num');

  if (!form) return;

  // ── Utility: show/hide a step ──
  function showStep(n) {
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var el = document.getElementById('step-' + i);
      if (el) {
        el.classList.toggle('active', i === n);
      }
    }
    currentStep = n;
    if (currentStepNum) currentStepNum.textContent = n;
    updateProgress(n);
  }

  // ── Update progress indicator ──
  function updateProgress(n) {
    var steps = document.querySelectorAll('.progress-step');
    steps.forEach(function (step) {
      var sn = parseInt(step.getAttribute('data-step'), 10);
      step.classList.remove('active', 'done');
      if (sn < n) step.classList.add('done');
      if (sn === n) step.classList.add('active');

      // Checkmark for done steps
      var dot = step.querySelector('.progress-step-dot');
      if (dot) {
        if (sn < n) {
          dot.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        } else {
          dot.textContent = sn;
        }
      }
    });

    // Update connectors
    var connectors = document.querySelectorAll('.progress-step-connector');
    connectors.forEach(function (conn) {
      var after = parseInt(conn.getAttribute('data-after'), 10);
      conn.classList.toggle('done', after < n);
    });
  }

  // ── Choice card selection ──
  function initChoiceGrid(gridId, hiddenInputId) {
    var grid = document.getElementById(gridId);
    var hidden = document.getElementById(hiddenInputId);
    if (!grid || !hidden) return;

    grid.querySelectorAll('.choice-card').forEach(function (card) {
      card.addEventListener('click', function () {
        grid.querySelectorAll('.choice-card').forEach(function (c) {
          c.classList.remove('selected', 'selected-yellow');
        });
        card.classList.add('selected');
        hidden.value = card.getAttribute('data-value') || card.textContent.trim();

        // Emergency step special logic
        if (hiddenInputId === 'urgency_level') {
          var reminder = document.getElementById('emergency-reminder');
          if (reminder) {
            var isEmergency = (hidden.value.toLowerCase().indexOf('emergency') !== -1);
            reminder.style.display = isEmergency ? 'block' : 'none';
            // Re-init lucide for the newly shown icon
            if (isEmergency && window.lucide) lucide.createIcons();
          }
        }
      });
    });
  }

  initChoiceGrid('service-choice-grid', 'service_category');
  initChoiceGrid('property-choice-grid', 'property_type');
  initChoiceGrid('urgency-choice-grid', 'urgency_level');

  // ── Navigation: Next buttons ──
  function nextStep(fromStep) {
    // Validate current step if needed
    if (fromStep === 1) {
      var sc = document.getElementById('service_category');
      if (!sc || !sc.value) {
        alert('Please select a service category to continue.');
        return;
      }
    }
    if (fromStep === 3) {
      var pt = document.getElementById('property_type');
      if (!pt || !pt.value) {
        alert('Please select a property type to continue.');
        return;
      }
    }
    if (fromStep === 4) {
      var ul = document.getElementById('urgency_level');
      if (!ul || !ul.value) {
        alert('Please select an urgency level to continue.');
        return;
      }
    }
    showStep(fromStep + 1);
    scrollToForm();
  }

  function prevStep(fromStep) {
    showStep(fromStep - 1);
    scrollToForm();
  }

  function scrollToForm() {
    var card = document.querySelector('.form-card');
    if (card) {
      var offset = card.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }

  // Wire up Next buttons
  var nextBtns = [
    { id: 'step1-next', from: 1 },
    { id: 'step2-next', from: 2 },
    { id: 'step3-next', from: 3 },
    { id: 'step4-next', from: 4 },
    { id: 'step5-next', from: 5 },
    { id: 'step6-next', from: 6 }
  ];

  nextBtns.forEach(function (nb) {
    var btn = document.getElementById(nb.id);
    if (btn) {
      btn.addEventListener('click', function () {
        nextStep(nb.from);
      });
    }
  });

  // Wire up Back buttons
  var backBtns = [
    { id: 'step2-back', from: 2 },
    { id: 'step3-back', from: 3 },
    { id: 'step4-back', from: 4 },
    { id: 'step5-back', from: 5 },
    { id: 'step6-back', from: 6 },
    { id: 'step7-back', from: 7 }
  ];

  backBtns.forEach(function (bb) {
    var btn = document.getElementById(bb.id);
    if (btn) {
      btn.addEventListener('click', function () {
        prevStep(bb.from);
      });
    }
  });

  // ── Photo upload preview ──
  var photoInput = document.getElementById('photo-upload');
  var previewContainer = document.getElementById('upload-preview');
  var uploadZone = document.getElementById('upload-zone');

  if (photoInput && previewContainer) {
    photoInput.addEventListener('change', function () {
      previewContainer.innerHTML = '';
      var files = Array.from(photoInput.files);
      files.forEach(function (file) {
        if (!file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          var img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'upload-preview-thumb';
          img.alt = file.name;
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  if (uploadZone) {
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('drag-over');
    });
    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      if (photoInput) {
        photoInput.files = e.dataTransfer.files;
        photoInput.dispatchEvent(new Event('change'));
      }
    });
  }

  // ── Form submission ──
  // The deploy system handles actual email submission.
  // We show the success state on the wl-success hidden div being revealed,
  // or handle the native form submit to show our custom success panel.
  form.addEventListener('submit', function () {
    // Let the deploy system handle the POST; watch for data-wl-success
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' && m.attributeName === 'style') {
          var successMsg = form.querySelector('[data-wl-success]');
          if (successMsg && successMsg.style.display !== 'none') {
            form.style.display = 'none';
            if (successState) successState.style.display = 'block';
            if (window.lucide) lucide.createIcons();
          }
        }
      });
    });

    var successEl = form.querySelector('[data-wl-success]');
    if (successEl) {
      observer.observe(successEl, { attributes: true });
    }
  });

  // Set minimum date for date pickers to today
  var today = new Date().toISOString().split('T')[0];
  var datePickers = [
    document.getElementById('preferred_date'),
    document.getElementById('alt_date')
  ];
  datePickers.forEach(function (dp) {
    if (dp) dp.setAttribute('min', today);
  });

  // Initialize to step 1
  showStep(1);

})();
