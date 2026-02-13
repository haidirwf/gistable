<script>
  import { onMount, tick, afterUpdate } from 'svelte';
  import { gists, currentGistId, currentFileId, openFileIds, currentUser, saveStatus, unsavedContent } from '../lib/stores';
  import { supabaseEnabled, supabaseClient } from '../lib/supabase';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-markdown';
  import 'prismjs/components/prism-javascript';
  import 'prismjs/components/prism-css';
  // Add other languages as needed or use autoloader if configured in vite

  $: activeGist = $currentGistId ? $gists[$currentGistId] : null;
  $: file = activeGist && $currentFileId ? activeGist.files.find(f => f.id === $currentFileId) : null;
  $: isLoggedIn = !!$currentUser;
  $: isOwner = activeGist && isLoggedIn && activeGist.user_id === $currentUser.id;
  $: editable = isLoggedIn && isOwner;

  let editorEl;
  let previewEl;
  let lineNumbersEl;
  let localContent = '';

  // Load content when file changes
  $: if (file && activeGist) {
    const unsaved = unsavedContent.get(activeGist.id, file.id);
    localContent = unsaved != null ? unsaved : (file.content || '');
  } else {
    localContent = '';
  }

  // Highlight logic
  async function highlight() {
    await tick();
    if (previewEl && window.Prism) {
      Prism.highlightElement(previewEl);
    }
  }

  // Trigger highlight on content/lang change
  $: if (localContent !== undefined && file) highlight();

  function handleInput(e) {
    localContent = e.target.value;
    if (activeGist && file) {
      unsavedContent.set(activeGist.id, file.id, localContent);
      saveStatus.set('Unsaved changes');
    }
  }

  function handleScroll() {
    if (previewEl && editorEl) {
      previewEl.scrollTop = editorEl.scrollTop;
      previewEl.scrollLeft = editorEl.scrollLeft;
      lineNumbersEl.scrollTop = editorEl.scrollTop;
    }
  }

  function closeTab(id) {
    $openFileIds = $openFileIds.filter(fid => fid !== id);
    if ($currentFileId === id) {
      const remaining = $openFileIds.filter(fid => activeGist.files.some(f => f.id === fid));
      $currentFileId = remaining[0] || (activeGist.files[0] ? activeGist.files[0].id : null);
    }
  }

  function updateFilename(e) {
    if(file && editable) {
       file.filename = e.target.value;
       $gists[$currentGistId] = activeGist;
       saveStatus.set('Unsaved changes');
    }
  }

  function updateLanguage(e) {
      if(file && editable) {
          file.language = e.target.value;
          $gists[$currentGistId] = activeGist;
          saveStatus.set('Unsaved changes');
      }
  }

  let isSaving = false;
  async function saveGist() {
    if (!editable || !activeGist) return;
    
    // Commit current file changes to object
    if (file) {
      file.content = localContent;
      // Clear unsaved storage
      unsavedContent.remove(activeGist.id, file.id);
    }

    isSaving = true;
    saveStatus.set('Saving...');

    try {
      if (supabaseEnabled && supabaseClient) {
         // Placeholder logic for Supabase implementation
         // await supabaseClient.from('gists').upsert({...})
      }
      
      // Update store (triggers LocalStorage save)
      $gists[$currentGistId] = activeGist;
      
      saveStatus.set(supabaseEnabled ? 'Saved (Supabase)' : 'Saved (mock)');
    } catch (e) {
      console.error(e);
      saveStatus.set('Save failed');
    } finally {
      isSaving = false;
    }
  }
</script>

<section class="editor-area">
  <div class="tabs">
    {#each $openFileIds as fid}
      {#if activeGist && activeGist.files.find(f => f.id === fid)}
        {@const f = activeGist.files.find(f => f.id === fid)}
        <div 
          class="tab {fid === $currentFileId ? 'active' : ''}" 
          on:click={() => $currentFileId = fid}
        >
          <span>{f.filename}</span>
          <span class="tab-close" on:click|stopPropagation={() => closeTab(fid)}>×</span>
        </div>
      {/if}
    {/each}
  </div>

  <div class="editor-toolbar">
    <div class="editor-file-meta">
      <input
        type="text"
        class="input input-sm"
        placeholder="Filename"
        disabled={!file || !editable}
        value={file ? file.filename : ''}
        on:change={updateFilename}
      />
      <select 
        class="input input-sm" 
        disabled={!file || !editable}
        value={file ? file.language : 'plaintext'}
        on:change={updateLanguage}
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="css">CSS</option>
        <option value="html">HTML</option>
        <option value="markdown">Markdown</option>
        <option value="plaintext">Plain text</option>
      </select>
    </div>
    <div class="editor-actions">
      <button 
        class="btn {isSaving ? 'is-loading' : ''}" 
        disabled={!editable || !activeGist} 
        on:click={saveGist}
      >
        Save Gist
      </button>
    </div>
  </div>

  <div class="editor-wrapper">
    <div class="editor-container">
      <div class="editor-inner">
        <div class="editor-gutter" bind:this={lineNumbersEl}>
           {#if localContent}
             {#each localContent.split('\n') as _, i}
               <div class="editor-gutter-line">{i + 1}</div>
             {/each}
           {/if}
        </div>
        <textarea
          bind:this={editorEl}
          class="code-editor"
          spellcheck="false"
          value={localContent}
          on:input={handleInput}
          on:scroll={handleScroll}
          readonly={!file || !editable}
        ></textarea>
        <pre class="code-preview" bind:this={previewEl}>
          <code class="language-{file ? file.language : 'plaintext'}">{localContent}</code>
        </pre>
      </div>
    </div>
  </div>

  {#if !editable}
  <div class="readonly-banner">
    <span class="muted-text">
      This gist is in read-only mode. Login to edit this gist.
    </span>
  </div>
  {/if}
</section>