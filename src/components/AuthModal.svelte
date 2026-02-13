<script>
  import { createEventDispatcher } from 'svelte';
  import { supabaseEnabled, supabaseClient } from '../lib/supabase';
  import { currentUser } from '../lib/stores';

  export let show = false;
  export let mode = 'login'; // login | signup

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let errorMsg = '';
  let loading = false;

  function close() {
    dispatch('close');
    email = '';
    password = '';
    errorMsg = '';
  }

  async function handleSubmit() {
    if (!email || !password) {
      errorMsg = 'Email and password required';
      return;
    }
    loading = true;
    errorMsg = '';

    try {
      if (supabaseEnabled && supabaseClient) {
        let result;
        if (mode === 'signup') {
          result = await supabaseClient.auth.signUp({ email, password });
        } else {
          result = await supabaseClient.auth.signInWithPassword({ email, password });
        }
        if (result.error) throw result.error;
        
        currentUser.set({
           id: result.data.user.id,
           email: result.data.user.email
        });
      } else {
        // Mock Auth Logic
        const mockId = email.toLowerCase();
        currentUser.set({ id: mockId, email });
      }
      close();
    } catch (e) {
      errorMsg = e.message || 'Auth failed';
    } finally {
      loading = false;
    }
  }
</script>

{#if show}
<div class="modal">
  <div class="modal-backdrop" on:click={close}></div>
  <div class="modal-content">
    <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
    <form on:submit|preventDefault={handleSubmit}>
      <label class="form-label" for="auth-email">Email</label>
      <input id="auth-email" type="email" class="input" bind:value={email} required />

      <label class="form-label" for="auth-password">Password</label>
      <input id="auth-password" type="password" class="input" bind:value={password} required />

      <div class="form-error">{errorMsg}</div>

      <div class="modal-actions">
        <button type="submit" class="btn {loading ? 'is-loading' : ''}">Continue</button>
        <button type="button" class="btn btn-secondary" on:click={close}>Cancel</button>
      </div>
    </form>
  </div>
</div>
{/if}