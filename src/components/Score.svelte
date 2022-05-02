<script lang="ts">
    import { Writable } from 'svelte/store';

    export let score: Writable<number>;
    export let size: number;
</script>

<span style={`font-size: ${size}px`}>{$score}</span>

<style lang="scss">
    span {
        color: white;
    }
</style>
