import esbuild from "esbuild";
import jsdomPatch from "./plugin/jsdomPatch.cjs";

await esbuild
    .build({
        entryPoints: ["src/main.ts"],
        outfile: "dist/main.js",
        platform: "node",
        target: "node21",
        bundle: true,
        plugins: [jsdomPatch],
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
