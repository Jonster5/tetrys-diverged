<script lang="ts">
    import { onMount } from 'svelte';
    import { ClassicGame } from '@lib/game';
    import Header from '@components/Header.svelte';

    let target: HTMLElement;
    let game: ClassicGame;

    let hasLoaded = false;

    onMount(() => {
        game = new ClassicGame(target);
        hasLoaded = true;
    });

    const restart = () => {
        if (hasLoaded) {
            game.restart();
        }
    };
</script>

<div bind:this={target} />

{#if hasLoaded}
    <Header {...game.UIProps()} on:restart={restart} />
{/if}

<style lang="scss">
    div {
        width: 100%;
        height: 100%;

        background: black;
    }
</style>
