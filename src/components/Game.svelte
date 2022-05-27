<script lang="ts">
    import { onMount } from 'svelte';
    import { ClassicGame } from '@lib/game';
    import Header from '@components/Header.svelte';
    import { getStorage } from '@lib/storage';

    let target: HTMLElement;
    let game: ClassicGame;

    let hasLoaded = false;

    onMount(() => {
        const storage = getStorage();

        game = new ClassicGame(target, storage);
        hasLoaded = true;
    });

    const restart = () => {
        if (hasLoaded) {
            game.restart();
        }
    };

    const keyDown = (e: KeyboardEvent) => {
        if (e.key === 'r') {
            restart();
        }
    };
</script>

<svelte:window on:keydown={keyDown} />

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
