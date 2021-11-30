<template>
    <div class="container rows">
        <div class="cols" style="font-weight: bold; align-items: center;">
            <n-icon size="20">
                <search-outlined/>
            </n-icon>
            <a href="https://www.human-anatomy-for-artist.com/" target="_blank">Human Anatomy for Artist</a>
            &nbsp;Unofficial Search Helper
        </div>

        <div class="fill cols">
            <div class="rows" style="width: 320px; height: 100%; overflow: auto;">
                <div class="cols">
                    <n-select class="fill"
                              size="small"
                              placeholder="Joint / Body Part"
                              filterable
                              clearable
                              :options="bodyPartOptions"
                              v-model:value="bodyPart"
                    />
                    <n-button size="small"
                              type="primary"
                              @click="onSearch"
                              :disabled="!bodyPart"
                    >
                        Search
                    </n-button>
                </div>

                <div class="description">
                    <div>Wheel: Rotate Camera / Zoom</div>
                    <div>Mouse Right: Move Camera</div>
                    <div>Shift + Mouse Left: Rotate Joint</div>
                </div>

                <skeleton-model-canvas style="width: 100%; height: 400px; min-height: 400px;"
                                       :model="model"
                                       :highlights="matchers[bodyPart]?.highlights"
                />

                <div class="description">
                    <div>
                        This page is a third party search helper for
                        <a href="https://www.human-anatomy-for-artist.com"
                           target="_blank">human-anatomy-for-artist.com</a>.
                    </div>
                    <div>
                        Currently less than 1% of the photos are included. More data will be added slowly.
                    </div>
                    <div>
                        <a href="https://github.com/x6ud/x6ud.github.io/issues" target="_blank">Leave a message</a>
                    </div>
                    <div>
                        <a href="https://github.com/x6ud/human-anatomy-for-artist-search-helper" target="_blank">
                            Source code
                        </a>
                    </div>
                    <div>
                        <a href="https://x6ud.github.io/female-anatomy-for-artist-search-helper" target="_blank">
                            Female body art reference search
                        </a>
                    </div>
                    <div>
                        <a href="https://x6ud.github.io/pose-search" target="_blank">
                            Another page for searching photos by pose</a>
                    </div>
                </div>
            </div>

            <div class="scroll-list fill"
                 ref="searchResultsContainerDom"
            >
                <div class="loading" v-if="loadingData && !searchResults?.length">
                    Loading data...
                </div>
                <div class="warning"
                     v-if="!searchResults?.length && (!supportWebGL2 || !supportMouse)"
                     style="font-size: 16px;"
                >
                    <div v-if="!supportWebGL2">
                        <n-icon>
                            <warning-outlined/>
                        </n-icon>
                        This page requires WebGL2 but your system does not seem to support.
                        Try updating your graphics card drivers or changing your browser.
                    </div>
                    <div v-if="!supportMouse">
                        <n-icon>
                            <warning-outlined/>
                        </n-icon>
                        This page currently supports mouse operation only.
                    </div>
                </div>

                <a v-for="photo in searchResults"
                   class="item photo"
                   :data-id="photo.id"
                   :href="`https://www.human-anatomy-for-artist.com/photos/show/id/${photo.id}`"
                   rel="noreferrer"
                   target="_blank"
                >
                    <img :src="photo.url"
                         :style="{transform: photo.flipped ? 'scaleX(-1)': null}"
                         alt=""
                         referrerpolicy="no-referrer"
                    >
                </a>
            </div>
        </div>
    </div>
</template>

<script src="./Search.ts"></script>

<style lang="scss">
.container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 4px;
}

.rows {
    display: flex;
    flex-direction: column;

    & > *:not(:last-child) {
        margin-bottom: 4px;
    }

    & > .fill {
        flex: 1 1;
        min-height: 0;
    }
}

.cols {
    display: flex;

    & > *:not(:last-child) {
        margin-right: 4px;
    }

    & > .fill {
        flex: 1 1;
        min-width: 0;
    }
}

.scroll-list {
    position: relative;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    overflow: auto;
    padding: 4px;

    .n-spin-container,
    .n-spin-content {
        width: 100%;
        height: 100%;
    }

    .item {
        float: left;
        margin: 0 4px 4px;
    }
}

.photo {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
    background: #f2f2f2;
    user-select: none;

    img {
        max-width: 100%;
        max-height: 100%;
    }

    .anchor {
        position: absolute;
        z-index: 2;
    }
}

a {
    text-decoration: none;
    font-size: inherit;
    color: #1890ff;
    white-space: nowrap;

    &:hover {
        text-decoration: underline;
    }
}

.description {
    color: #c2c2c2;
    font-size: 12px;
    line-height: 1.5em;
}
</style>