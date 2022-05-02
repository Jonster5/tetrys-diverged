<script lang="ts">
    import { Writable } from 'svelte/store';

    export let highscore: Writable<number>;
</script>

<span>High Score: {600}</span>

<style lang="scss">
    span {
        color: white;
    }
</style>
