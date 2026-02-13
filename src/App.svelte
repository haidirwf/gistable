<script>
  import { onMount } from 'svelte';
  import { supabaseEnabled, supabaseClient } from './lib/supabase';
  import { currentUser, gists, currentGistId, currentFileId, openFileIds } from './lib/stores';
  import Header from './components/Header.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Editor from './components/Editor.svelte';
  import AuthModal from './components/AuthModal.svelte';

  let showAuthModal = false;
  let authMode = 'login';

  // Initialize Data
  onMount(async () => {
    // 1. Auth check
    if (supabaseEnabled && supabaseClient) {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        currentUser.set({ id: session.user.id, email: session.user.email });
      }
    }

    // 2. Load Gist from URL or Default
    const params = new URLSearchParams(window.location.search);
    const id = params.get('gist');
    const allGists = $gists; // get value from store

    if (id && allGists[id]) {
      selectGist(id);
    } else {
      const firstId = Object.keys(allGists)[0];
      if (firstId) selectGist(firstId);
    }
  });

  function selectGist(id) {
    const allGists = $gists;
    const gist = allGists[id];
    if (gist) {
        currentGistId.set(id);
        const fIds = gist.files.map(f => f.id);
        openFileIds.set(fIds);
        currentFileId.set(fIds.length ? fIds[0] : null);
    }
  }

  function handleOpenAuth(event) {
    authMode = event.detail;
    showAuthModal = true;
  }

  async function handleLogout() {
    if (supabaseEnabled && supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    currentUser.set(null);
  }
</script>

<div id="app">
  <Header 
    on:openAuth={handleOpenAuth} 
    on:logout={handleLogout} 
  />

  <main class="app-main">
    <Sidebar />
    <Editor />
  </main>
</div>

<AuthModal 
  show={showAuthModal} 
  mode={authMode} 
  on:close={() => showAuthModal = false} 
/>