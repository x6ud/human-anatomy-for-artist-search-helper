<template>
    <div class="container rows">
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

        <div class="scroll-list fill">
            <n-spin :show="pageLoading">
                <div v-for="photo in pageData"
                     class="item photo"
                     :data-id="photo.id"
                >
                    <img :src="photo.landmarksImage || photo.url"
                         alt=""
                         referrerpolicy="no-referrer"
                    >
                </div>
            </n-spin>
        </div>

        <div class="cols" style="font-size: 12px; align-items: center;">
            <div class="fill"></div>
            <div class="fill"></div>
            <n-input style="width: 60px;"
                     size="tiny"
                     placeholder="Page"
                     v-model:value="pageNum"
                     @keypress.enter="loadPage"
            />
            <span>/ {{ numOfPages }}</span>
            <n-button size="tiny"
                      @click="prevPage"
            >
                Prev
            </n-button>
            <n-button size="tiny"
                      @click="nextPage"
            >
                Next
            </n-button>
        </div>
    </div>
</template>

<script src="./DatasetManager.ts"></script>

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
</style>