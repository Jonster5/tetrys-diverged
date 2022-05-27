<script lang="ts">
    import { convertToNewFormat } from '@lib/storage';
    import { onMount } from 'svelte';
    import Game from './components/Game.svelte';

    onMount(() => {
        convertToNewFormat();
    });
</script>

<Game />
