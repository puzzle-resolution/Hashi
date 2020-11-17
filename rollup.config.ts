import typescript from "rollup-plugin-typescript2";
import sourceMaps from "rollup-plugin-sourcemaps";

export default {
    input: "./src/Hashi.ts",
    plugins: [
        typescript({
            exclude: "node_modules/**",
            typescript: require("typescript")
        }),
        sourceMaps(),
    ],
    output: [
        {
            format: "es",
            file: "dist/bundle.esm.js",
            sourcemap: true
        }
    ]
};