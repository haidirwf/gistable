<script>
  import { gists, currentGistId, currentFileId, openFileIds, currentUser, saveStatus, uuid, unsavedContent } from '../lib/stores';

  $: activeGist = $currentGistId ? $gists[$currentGistId] : null;
  $: isLoggedIn = !!$currentUser;
  $: isOwner = activeGist && isLoggedIn && activeGist.user_id === $currentUser.id;
  $: editable = isLoggedIn && isOwner;
  $: files = activeGist ? activeGist.files : [];

  function selectFile(id) {
    $currentFileId = id;
    if (!$openFileIds.includes(id)) {
      $openFileIds = [...$openFileIds, id];
    }
  }

  function createNewFile() {
    if (!editable) return;
    const baseName = 'untitled';
    let name = `${baseName}.js`;
    let counter = 1;
    while (files.some((f) => f.filename === name)) {
      name = `${baseName}-${counter}.js`;
      counter++;
    }
    const fileId = uuid();
    const newFile = {
      id: fileId,
      filename: name,
      language: 'javascript',
      content: '',
      created_at: new Date().toISOString(),
    };
    
    // Update store
    activeGist.files.push(newFile);
    $gists[$currentGistId] = activeGist;
    
    selectFile(fileId);
    saveStatus.set('New file created (mock)');
  }

  function renameFile() {
    if (!editable || !$currentFileId) return;
    const file = files.find(f => f.id === $currentFileId);
    if (!file) return;

    const newName = prompt('Rename file', file.filename);
    if (!newName || newName === file.filename) return;

    file.filename = newName;
    $gists[$currentGistId] = activeGist;
    saveStatus.set('File renamed (mock)');
  }

  function deleteFile() {
    if (!editable || !$currentFileId) return;
    const file = files.find(f => f.id === $currentFileId);
    if (!file) return;

    if (!confirm(`Delete file "${file.filename}" from this gist?`)) return;

    // Logic delete
    activeGist.files = activeGist.files.filter((f) => f.id !== file.id);
    $gists[$currentGistId] = activeGist;
    
    // Cleanup unsaved
    unsavedContent.remove(activeGist.id, file.id);

    // Update selection
    $openFileIds = $openFileIds.filter(id => id !== file.id);
    if ($currentFileId === file.id) {
        $currentFileId = activeGist.files[0] ? activeGist.files[0].id : null;
    }
    
    saveStatus.set('File deleted (mock)');
  }

  function updateMeta() {
     $gists[$currentGistId] = activeGist;
     saveStatus.set('Unsaved changes');
  }

  let shareMsg = '';
  async function copyLink() {
    const url = new URL(window.location.href);
    if($currentGistId) url.searchParams.set('gist', $currentGistId);
    try {
      await navigator.clipboard.writeText(url.toString());
      shareMsg = 'Link copied.';
    } catch (e) {
      shareMsg = 'Failed to copy.';
    }
    setTimeout(() => shareMsg = '', 2500);
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <h2 class="sidebar-title">Files</h2>
    <div class="sidebar-actions">
      <button on:click={createNewFile} disabled={!editable} class="btn btn-icon" title="New File">+</button>
      <button on:click={renameFile} disabled={!editable || !$currentFileId} class="btn btn-icon" title="Rename File">R</button>
      <button on:click={deleteFile} disabled={!editable || !$currentFileId} class="btn btn-icon" title="Delete File">×</button>
    </div>
  </div>
  
  <ul class="file-list">
    {#each files as file (file.id)}
      <li 
        class="file-item {file.id === $currentFileId ? 'active' : ''}" 
        on:click={() => selectFile(file.id)}
      >
        <div class="file-icon"></div>
        <span class="file-name">{file.filename}</span>
      </li>
    {/each}
  </ul>

  <div class="sidebar-section">
    <h3 class="sidebar-subtitle">Gist Settings</h3>
    {#if activeGist}
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={activeGist.is_public} on:change={updateMeta} disabled={!editable} />
      <span>Public gist</span>
    </label>
    <textarea
      class="input textarea sidebar-textarea"
      rows="3"
      placeholder="Description (optional)"
      bind:value={activeGist.description}
      on:input={updateMeta}
      disabled={!editable}
    ></textarea>
    {/if}
  </div>

  <div class="sidebar-section">
    <h3 class="sidebar-subtitle">Share</h3>
    <button on:click={copyLink} class="btn btn-full-width">Copy shareable link</button>
    <small class="muted-text">{shareMsg}</small>
  </div>
</aside>