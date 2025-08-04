import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";

export default [
    // JS files & README + LICENSE + package.json
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.cjs',
                format: 'cjs',
                sourcemap: false
            },
            {
                file: 'dist/index.mjs',
                format: 'es',
                sourcemap: false
            },
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.bundler.json',
                removeComments: true, // Remove comments from JS
                declaration: false,   // Don't generate .d.ts (we'll do that separately)
            }),
            copy({
                targets: [
                    {src: './README.md', dest: 'dist/'},
                    {src: './LICENSE', dest: 'dist/'},
                    {
                        src: './package.json',
                        dest: 'dist/',
                        transform: (contents) => {
                            const packageContents = JSON.parse(contents.toString());
                            delete packageContents['scripts'];
                            delete packageContents['devDependencies'];
                            delete packageContents['mocha'];
                            delete packageContents['type']; // Remove the type from package.json since we use .cjs/.mjs
                            
                            return JSON.stringify(packageContents, null, 2);
                        }
                    },
                ]
            }),
        ],
    },

    // Declaration files
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es'
        },
        plugins: [
            dts({
                tsconfig: './tsconfig.bundler.json',
                removeComments: false // Keep comments in .d.ts
            }),
        ]
    }
];