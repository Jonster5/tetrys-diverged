<script lang="ts">
    import Highscore from '@components/Highscore.svelte';

    import Score from '@components/Score.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Writable } from 'svelte/store';

    export let score: Writable<number>;
    export let highscore: Writable<number>;
    export let pause: Writable<boolean>;

    const dispatch = createEventDispatcher();

    $: size =
        (1 / Math.log10(Math.floor(~~$score.toString().length) ** 2 + 9)) * 60;

    const togglePause = () => {
        pause.update((p) => !p);
    };

    const restart = () => {
        dispatch('restart');
    };
</script>

<header>
    <div class="top">
        <div class="tsec btn-left">
            <img src="images/restart.svg" alt="restart" on:click={restart} />
            <img
                src={`images/${$pause ? 'play' : 'pause'}.svg`}
                alt="pause"
                on:click={togglePause}
            />
        </div>
        <div class="tsec score">
            <Score {score} {size} />
        </div>
        <div class="tsec btn-right">
            <img src="images/leaderboard.svg" alt="leaderboard" />
            <img src="images/settings.svg" alt="settings" />
        </div>
    </div>
    <div class="line" />
    <div class="bottom">
        <Highscore {highscore} />
    </div>
</header>

<style lang="scss">
    header {
        position: absolute;
        display: flex;

        width: 100%;

        top: 0;
        left: 0;

        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        user-select: none;

        .top {
            display: flex;
            width: 100%;
            height: 90px;

            justify-content: space-evenly;

            .tsec {
                display: flex;
                width: calc(100% / 3);
                height: 100%;

                justify-content: center;
                align-items: center;

                img {
                    margin: 0 1px;

                    filter: invert(1);
                    border-radius: 5px;

                    -webkit-user-drag: none;

                    transition-duration: 50ms;

                    &:hover {
                        cursor: pointer;

                        background: rgb(213, 213, 213);
                    }

                    &:active {
                        background: rgb(170, 170, 170);
                    }
                }
            }

            .btn-left {
                justify-content: center;
                align-items: center;

                img {
                    width: 30px;
                    height: 30px;
                }
            }

            .score {
                justify-content: center;
                align-items: center;
            }

            .btn-right {
                justify-content: center;
                align-items: center;

                img {
                    width: 30px;
                    height: 30px;
                }
            }
        }

        .line {
            width: 100%;
            height: 1px;

            background: #ff0000;
        }

        .bottom {
            display: flex;
            width: 100%;
            height: 50%;

            justify-content: center;
            align-items: center;
        }
    }
</style>
