document.addEventListener('DOMContentLoaded', () => {
  
  // TABS LOGIC
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');

      // Refresh data on tab switch
      if (btn.dataset.target === 'queue-section') fetchQueue();
      if (btn.dataset.target === 'subscriptions-section') fetchSubscriptions();
    });
  });

  // MEDIA TYPE TOGGLE
  const typeSelect = document.getElementById('type');
  const audioOptions = document.getElementById('audio-options');
  const videoOptions = document.getElementById('video-options');

  typeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'video') {
      audioOptions.classList.add('hidden');
      videoOptions.classList.remove('hidden');
    } else {
      videoOptions.classList.add('hidden');
      audioOptions.classList.remove('hidden');
    }
  });

  // DIRECT DOWNLOAD LOGIC
  const downloadForm = document.getElementById('download-form');
  const btnText = document.querySelector('.btn-text');
  const spinner = document.querySelector('.spinner');
  const progressContainer = document.getElementById('progress-container');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  const submitBtn = downloadForm.querySelector('button[type="submit"]');

  downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('url').value;
    const type = document.getElementById('type').value;
    let format, quality;
    
    if (type === 'video') {
       format = document.getElementById('videoFormat').value;
       quality = document.getElementById('videoQuality').value;
    } else {
       format = document.getElementById('format').value;
       quality = document.getElementById('quality').value;
    }

    const options = { type, format, quality };

    // Reset UI
    progressContainer.classList.remove('hidden');
    progressBarFill.style.width = '0%';
    progressText.innerText = 'Initializing Download...';
    progressText.style.color = 'var(--text-muted)';
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, options })
      });

      if (!response.ok) throw new Error('Failed to initiate download');

      // Set up EventSource for streaming progress
      const eventSource = new EventSource(`/api/download/stream?url=${encodeURIComponent(url)}`);

      eventSource.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === 'progress') {
          const progress = payload.data.progress;
          progressBarFill.style.width = `${progress}%`;
          progressText.innerText = `Downloading... ${progress}%`;
        } 
        else if (payload.type === 'complete') {
          progressBarFill.style.width = `100%`;
          progressBarFill.style.background = 'var(--success)';
          progressText.innerText = `Success! Saved to: ${payload.data.outputDir}`;
          progressText.style.color = 'var(--success)';
          finishDirectDownload(eventSource);
        }
        else if (payload.type === 'error') {
          progressText.innerText = `Error: ${payload.data}`;
          progressText.style.color = 'var(--danger)';
          progressBarFill.style.background = 'var(--danger)';
          finishDirectDownload(eventSource);
        }
      };

      eventSource.onerror = (err) => {
         console.error('EventSource failed:', err);
         eventSource.close();
      };

    } catch (err) {
      progressText.innerText = `Error: ${err.message}`;
      progressText.style.color = 'var(--danger)';
      finishDirectDownload(null);
    }
  });

  function finishDirectDownload(eventSource) {
    if (eventSource) eventSource.close();
    btnText.style.display = 'block';
    spinner.style.display = 'none';
    submitBtn.disabled = false;
  }

  // QUEUE LOGIC
  const fetchQueue = async () => {
    const res = await fetch('/api/queue');
    const data = await res.json();
    
    const activeList = document.getElementById('queue-active-list');
    const completedList = document.getElementById('queue-completed-list');
    const failedList = document.getElementById('queue-failed-list');

    activeList.innerHTML = '';
    completedList.innerHTML = '';
    failedList.innerHTML = '';

    const pendingCount = data.pending.length;
    if (data.active > 0) activeList.innerHTML += `<li class="active">Processing ${data.active} item(s)...</li>`;
    data.pending.forEach(p => activeList.innerHTML += `<li>${p.url}</li>`);
    if (pendingCount === 0 && data.active === 0) activeList.innerHTML = '<li>No active downloads.</li>';

    data.results.successful.forEach(s => completedList.innerHTML += `<li class="success">${s.url} <span>✅</span></li>`);
    if (data.results.successful.length === 0) completedList.innerHTML = '<li>None yet.</li>';

    data.results.failed.forEach(f => failedList.innerHTML += `<li class="error">${f.url} <span>❌</span></li>`);
    if (data.results.failed.length === 0) failedList.innerHTML = '<li>None yet.</li>';
  };

  document.getElementById('btn-add-queue').addEventListener('click', async () => {
    const url = document.getElementById('queue-url').value;
    if (!url) return;
    await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    document.getElementById('queue-url').value = '';
    fetchQueue();
  });

  const queueControl = async (action) => {
    await fetch('/api/queue/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    fetchQueue();
  };

  document.getElementById('btn-pause-queue').addEventListener('click', () => queueControl('pause'));
  document.getElementById('btn-resume-queue').addEventListener('click', () => queueControl('resume'));
  document.getElementById('btn-clear-queue').addEventListener('click', () => queueControl('clear'));

  // SUBSCRIPTIONS LOGIC
  const fetchSubscriptions = async () => {
    const res = await fetch('/api/subscriptions');
    const data = await res.json();
    const list = document.getElementById('subs-list');
    list.innerHTML = '';
    
    if (data.length === 0) {
      list.innerHTML = '<li>No active subscriptions.</li>';
      return;
    }

    data.forEach(sub => {
      list.innerHTML += `<li><strong>${sub.name}</strong> <span style="font-size:0.8rem; color:var(--text-muted)">${sub.url}</span></li>`;
    });
  };

  document.getElementById('btn-add-sub').addEventListener('click', async () => {
    const name = document.getElementById('sub-name').value;
    const url = document.getElementById('sub-url').value;
    if (!name || !url) return;
    await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url })
    });
    document.getElementById('sub-name').value = '';
    document.getElementById('sub-url').value = '';
    fetchSubscriptions();
  });

  document.getElementById('btn-sync-subs').addEventListener('click', async () => {
    const btn = document.getElementById('btn-sync-subs');
    btn.innerText = 'Syncing Background Logs...';
    await fetch('/api/subscriptions/sync', { method: 'POST' });
    setTimeout(() => { btn.innerText = 'Sync Now (Download New)'; }, 2000);
  });

  // Poll queue occasionally if tab is open
  setInterval(() => {
    if (document.getElementById('queue-section').classList.contains('active')) {
      fetchQueue();
    }
  }, 2000);

  // MERGE LOGIC
  const mergeForm = document.getElementById('merge-form');
  const mergeBtnText = document.querySelector('.merge-btn-text');
  const mergeSpinner = document.querySelector('.merge-spinner');
  const mergeProgressContainer = document.getElementById('merge-progress-container');
  const mergeProgressBarFill = document.getElementById('merge-progress-bar-fill');
  const mergeProgressText = document.getElementById('merge-progress-text');
  const mergeSubmitBtn = document.getElementById('merge-submit-btn');

  mergeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const videoFile = document.getElementById('video-file').files[0];
    const audioFile = document.getElementById('audio-file').files[0];

    if (!videoFile || !audioFile) return;

    // Reset UI
    mergeProgressContainer.classList.remove('hidden');
    mergeProgressBarFill.style.width = '0%';
    mergeProgressText.innerText = 'Uploading files to server processing...';
    mergeProgressText.style.color = 'var(--text-muted)';
    mergeBtnText.style.display = 'none';
    mergeSpinner.style.display = 'block';
    mergeSubmitBtn.disabled = true;

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('audio', audioFile);

    try {
      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to initiate merge');
      
      const { jobId } = await response.json();

      // Listen for FFmpeg Progress
      const eventSource = new EventSource(`/api/download/stream?url=${jobId}`);

      eventSource.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === 'progress') {
          const progress = payload.data.progress;
          mergeProgressBarFill.style.width = `${progress}%`;
          mergeProgressText.innerText = `Merging... ${progress}%`;
        } 
        else if (payload.type === 'complete') {
          mergeProgressBarFill.style.width = `100%`;
          mergeProgressBarFill.style.background = 'var(--success)';
          mergeProgressText.innerText = `Success! Saved to: ${payload.data.outputDir}`;
          mergeProgressText.style.color = 'var(--success)';
          finishMerge(eventSource);
        }
        else if (payload.type === 'error') {
          mergeProgressText.innerText = `Error: ${payload.data}`;
          mergeProgressText.style.color = 'var(--danger)';
          mergeProgressBarFill.style.background = 'var(--danger)';
          finishMerge(eventSource);
        }
      };

      eventSource.onerror = (err) => {
         console.error('Merge EventSource failed:', err);
         eventSource.close();
      };

    } catch (err) {
      mergeProgressText.innerText = `Error: ${err.message}`;
      mergeProgressText.style.color = 'var(--danger)';
      finishMerge(null);
    }
  });

  function finishMerge(eventSource) {
    if (eventSource) eventSource.close();
    mergeBtnText.style.display = 'block';
    mergeSpinner.style.display = 'none';
    mergeSubmitBtn.disabled = false;
  }

});
