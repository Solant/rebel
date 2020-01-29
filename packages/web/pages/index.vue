<template>
    <div>
        <div class="text-3xl">BiMo online version</div>
        <div class="flex">
            <div class="flex-1">
                <client-only>
                    <codemirror
                        v-model="input"
                        :options="cmOptions"
                    />
                </client-only>
                <button @click="runCompiler" class="btn btn-blue">Compile</button>
                <div>
                    <span class="text-xl block">Options</span>
                    <label class="block">
                        <input type="checkbox" v-model="emitRuntime">
                        Emit runtime (makes code compilable and output bigger)
                    </label>
                </div>
                <div role="alert" v-if="result.message">
                    <div
                        class="text-white font-bold rounded-t px-4 py-2"
                        :class="result.success ? 'bg-green-500' : 'bg-red-500'"
                    >
                        {{ result.success ? 'Success' : 'Error' }}
                    </div>
                    <div class="border border-t-0 border-black-400 rounded-bpx-4 py-3">
                        <p>{{ result.message }}</p>
                    </div>
                </div>
            </div>
            <div class="flex-1">
                <client-only>
                    <codemirror
                        v-model="output"
                        :options="cmOptions"
                    />
                </client-only>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { compile } from '@rebel-struct/core';
    import { createComponent, reactive, ref } from '@vue/composition-api';
    import ts from '@rebel-struct/target-ts';

    export default createComponent({
        setup () {
            let input = ref(
`
default struct ArrayStruct {
    size: i32;
    data: array<i32<le>, #size>;
}
`);
            let output = ref('');
            let emitRuntime = ref(false);

            const cmOptions = reactive({
                tabSize: 4,
                lineNumbers: true,
                line: true,
                lineWrapping: true,
                theme: 'base16-light',
                mode: '',
            });

            const result = reactive({
                success: true,
                message: '',
                time: 0,
            });

            function runCompiler() {
                try {
                    const t0 = performance.now();
                    output.value = compile(input.value, ts, { emitRuntime: emitRuntime.value, target: 'ts' }).fileContent;
                    const t1 = performance.now();

                    result.time = t1 - t0;
                    result.success = true;
                    result.message = `Compiled in ${result.time} ms`;
                } catch (e) {
                    result.message = e.message;
                    result.success = false;

                    throw e;
                }
            }

            return {
                input,
                output,
                cmOptions,
                runCompiler,
                result,
                emitRuntime,
            }
        },
    })
</script>

<style>
    /* purgecss start ignore */
    @import '../node_modules/codemirror/lib/codemirror.css';
    @import '../node_modules/codemirror/addon/merge/merge.css';
    @import '../node_modules/codemirror/theme/base16-light.css';
    /* purgecss start ignore */

    .btn {
        @apply font-bold py-2 px-4 rounded;
    }
    .btn-blue {
        @apply bg-blue-500 text-white;
    }
    .btn-blue:hover {
        @apply bg-blue-700;
    }
</style>