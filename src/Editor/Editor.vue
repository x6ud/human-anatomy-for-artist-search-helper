<template>
    <div class="container rows">
        <div class="cols fill">
            <div class="rows fill">
                <div class="cols" style="font-size: 12px; align-items: center;">
                    <div class="fill"></div>
                    <n-input style="width: 60px;"
                             size="tiny"
                             placeholder="Page"
                             v-model:value="photoListPage"
                             @keypress.enter="loadPhotoListPage"
                    />
                    <span>/ {{ photoListNumOfPages }}</span>
                    <n-button size="tiny"
                              @click="photoListPrevPage"
                    >
                        Prev
                    </n-button>
                    <n-button size="tiny"
                              @click="photoListNextPage"
                    >
                        Next
                    </n-button>
                    <n-button type="primary"
                              size="tiny"
                              @click="processSelected"
                    >
                        Process
                    </n-button>
                </div>

                <div class="scroll-list fill">
                    <n-spin :show="photoListLoading">
                        <div v-for="photo in photoList"
                             class="item photo"
                             :data-id="photo.id"
                        >
                            <img :src="photo.thumb"
                                 :alt="photo.title"
                                 referrerpolicy="no-referrer"
                            >
                            <n-checkbox class="anchor"
                                        style="top: 4px; left: 4px;"
                                        size="small"
                                        v-model:checked="photo.selected"
                            />
                        </div>
                    </n-spin>
                </div>
            </div>

            <div class="rows fill">
                <div class="cols">
                    <div class="fill"></div>
                    <n-button size="tiny"
                              type="primary"
                              @click="addSelectedResultToDataset"
                    >
                        Add Records
                    </n-button>
                </div>
                <div class="scroll-list fill">
                    <n-progress v-if="processing"
                                style="position: absolute; z-index: 2; left: 50%; top: 50%; width: 250px; margin-left: -125px; margin-top: -8px;"
                                type="line"
                                :percentage="processingPercentage"
                                indicator-placement="inside"
                                processing
                    />

                    <div v-for="photo in detectResult"
                         class="item photo"
                         :data-id="photo.id"
                    >
                        <img :src="photo.landmarksImage || photo.url"
                             alt=""
                             referrerpolicy="no-referrer"
                        >
                        <n-checkbox class="anchor"
                                    style="top: 4px; left: 4px;"
                                    size="small"
                                    v-model:checked="photo.selected"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="cols" style="font-size: 12px; align-items: center;">
            <div class="fill"></div>
            <span>Num of Records: {{ datasetLength }}</span>
            <span>&nbsp;</span>
            <n-button size="tiny"
                      type="primary"
                      @click="saveDatasetToFile"
            >
                Save JSON
            </n-button>
        </div>
    </div>
</template>

<script src="./Editor.ts"></script>

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
    width: 100px;
    height: 100px;
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
</style>