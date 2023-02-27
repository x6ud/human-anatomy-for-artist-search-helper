<template>
    <div class="container rows">
        <div class="rows fill">
            <div class="cols" style="font-size: 12px; align-items: center;">
                <span>Num of Records: {{ datasetLength }}</span>
                <div class="fill"></div>
                <span>Total {{ totalPages }} / Page&nbsp;</span>
                <n-input style="width: 60px;"
                         size="tiny"
                         placeholder="Page Start"
                         v-model:value="pageStart"
                />
                <span>~</span>
                <n-input style="width: 60px;"
                         size="tiny"
                         placeholder="Page End"
                         v-model:value="pageEnd"
                />
                <n-button type="primary"
                          size="tiny"
                          @click="process"
                >
                    Crawl
                </n-button>
            </div>

            <div class="scroll-list fill">
                <div v-for="photo in detectResult"
                     class="item photo"
                     :data-id="photo.id"
                >
                    <img :src="photo.landmarksImage || photo.url"
                         alt=""
                         referrerpolicy="no-referrer"
                    >
                </div>
            </div>
        </div>
    </div>

    <div class="progress"
         v-if="processing"
    >
        <div class="cols"
             style="margin-bottom: 8px; align-items: center;"
        >
            <n-progress class="fill"
                        type="line"
                        :percentage="percent"
                        indicator-placement="inside"
                        processing
            />
            <div style="margin-right: 4px;">{{ progressText }}</div>
            <n-button @click="stop = true"
                      :disabled="stop"
                      size="tiny"
            >
                {{ stop ? 'Stopping' : 'Stop' }}
            </n-button>
        </div>
        <div style="font-size: 12px;">
            Remaining: {{ remaining }}
        </div>
    </div>
</template>

<script src="./Editor.ts"></script>

<style lang="scss" scoped>
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

.progress {
    position: fixed;
    z-index: 100;
    left: 50%;
    top: 30%;
    width: 480px;
    margin: 0 0 0 -240px;
    border: solid 1px #EFEFF5;
    padding: 10px;
    background: #fff;
    border-radius: 4px;
}

.scroll-list {
    position: relative;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    overflow: auto;
    padding: 4px;

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
}
</style>
