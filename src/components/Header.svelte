<script>
  import { currentUser, gists, currentGistId, saveStatus } from '../lib/stores';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  $: activeGist = $currentGistId ? $gists[$currentGistId] : null;
  $: isLoggedIn = !!$currentUser;
  $: isOwner = activeGist && isLoggedIn && activeGist.user_id === $currentUser.id;
</script>

<header class="app-header">
  <div class="app-header-left">
    <span class="app-logo">Gist Clone</span>
    <span class="app-subtitle">Supabase Ready</span> </div>
  <div class="app-header-center">
    <input
      type="text"
      id="gist-title-input" 
      class="input"
      placeholder="Gist title"
      value={activeGist ? activeGist.title : ''}
      on:input={(e) => {
        if (activeGist && isOwner) {
          activeGist.title = e.target.value;
          $gists[$currentGistId] = activeGist;
          saveStatus.set('Unsaved changes');
        }
      }}
      disabled={!isOwner}
    />
    <span id="save-status" class="save-status">{$saveStatus}</span>
  </div>
  <div class="app-header-right">
    <div id="auth-info" class="auth-info {isLoggedIn ? 'auth-info-logged-in' : 'auth-info-logged-out'}">
      <span id="auth-message" class="auth-message">
        {isLoggedIn ? $currentUser.email : 'Login to edit this gist'}
      </span>
    </div>
    <div class="auth-buttons">
      {#if !isLoggedIn}
        <button on:click={() => dispatch('openAuth', 'login')} class="btn" id="login-btn">Login</button>
        <button on:click={() => dispatch('openAuth', 'signup')} class="btn btn-secondary" id="signup-btn">Sign Up</button>
      {:else}
        <button on:click={() => dispatch('logout')} class="btn btn-danger" id="logout-btn">Logout</button>
      {/if}
    </div>
  </div>
</header>