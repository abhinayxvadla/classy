const fs = require("fs");
const path = require("path");

// 1. Remove nested magic-string in @tailwindcss/node to avoid ERR_REQUIRE_ESM
const nestedMagicString = path.join(__dirname, "../node_modules/@tailwindcss/node/node_modules/magic-string");
if (fs.existsSync(nestedMagicString)) {
  fs.rmSync(nestedMagicString, { recursive: true, force: true });
  console.log("Removed nested magic-string from @tailwindcss/node");
}

// 2. Patch schema-utils absolutePath check
const schemaFiles = [
  path.join(__dirname, "../node_modules/next/dist/compiled/schema-utils2/index.js"),
  path.join(__dirname, "../node_modules/next/dist/compiled/schema-utils3/index.js"),
];

for (const file of schemaFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");
    if (content.includes('t.includes("!")')) {
      content = content.replace(/const s=t\.includes\("!"\);/g, "const s=false;");
      fs.writeFileSync(file, content, "utf8");
      console.log("Successfully patched schema-utils:", file);
    }
  }
}

// 3. Patch entries.js to escape '!' in query strings for webpack loaders
const entriesFiles = [
  path.join(__dirname, "../node_modules/next/dist/build/entries.js"),
  path.join(__dirname, "../node_modules/next/dist/esm/build/entries.js"),
];

for (const file of entriesFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");
    let patched = content.replace(
      /\(0,\s*_querystring\.stringify\)\(([^)]+)\)\s*\}!/g,
      "(0, _querystring.stringify)($1).replace(/!/g, '%21')}!"
    );
    patched = patched.replace(
      /\(0,\s*querystring\.stringify\)\(([^)]+)\)\s*\}!/g,
      "(0, querystring.stringify)($1).replace(/!/g, '%21')}!"
    );
    if (patched !== content) {
      fs.writeFileSync(file, patched, "utf8");
      console.log("Successfully patched entries.js loader query strings:", file);
    }
  }
}

// 4. Patch bundle5.js to handle '!' in folder paths and matchResource
const bundle5Path = path.join(__dirname, "../node_modules/next/dist/compiled/webpack/bundle5.js");
if (fs.existsSync(bundle5Path)) {
  let content = fs.readFileSync(bundle5Path, "utf8");

  // Fix matchResource regex: /^([^!]+)!=!/ -> /^(.+?)!=!/
  const oldLt = "const lt=/^([^!]+)!=!/;";
  const newLt = "const lt=/^(.+?)!=!/;";
  if (content.includes(oldLt)) {
    content = content.replace(oldLt, newLt);
    console.log("Patched matchResource regex lt in bundle5.js");
  }

  const oldNMF = 'const Je=K.lastIndexOf("!");if(Je>=0){let v=K.slice(0,Je+1);let I;for(I=0;I<v.length&&v[I]==="!";I++){Qe+="!"}v=v.slice(I).replace(/!+$/,"").replace(/!!+/g,"!");Ne=v===""?[]:v.split("!");He=K.slice(Je+1)}else{Ne=[];He=K}';
  const newNMF = 'const _kSafe=K.replace(/UniGo!/g,"UniGo\\u0001");const Je=_kSafe.lastIndexOf("!");if(Je>=0){let v=_kSafe.slice(0,Je+1);let I;for(I=0;I<v.length&&v[I]==="!";I++){Qe+="!"}v=v.slice(I).replace(/!+$/,"").replace(/!!+/g,"!");Ne=v===""?[]:v.split("!").map(s=>s.replace(/\\u0001/g,"!"));He=_kSafe.slice(Je+1).replace(/\\u0001/g,"!")}else{Ne=[];He=K}';

  if (content.includes(oldNMF)) {
    content = content.replace(oldNMF, newNMF);
    console.log("Patched NormalModuleFactory in bundle5.js");
  }

  const oldContextify = 'const _contextify=(v,I)=>I.split("!").map((I=>absoluteToRequest(v,I))).join("!");';
  const newContextify = 'const _contextify=(v,I)=>I.replace(/UniGo!/g,"UniGo\\u0001").split("!").map((I=>absoluteToRequest(v,I.replace(/\\u0001/g,"!")))).join("!");';

  const oldAbsolutify = 'const _absolutify=(v,I)=>I.split("!").map((I=>requestToAbsolute(v,I))).join("!");';
  const newAbsolutify = 'const _absolutify=(v,I)=>I.replace(/UniGo!/g,"UniGo\\u0001").split("!").map((I=>requestToAbsolute(v,I.replace(/\\u0001/g,"!")))).join("!");';

  if (content.includes(oldContextify)) {
    content = content.replace(oldContextify, newContextify);
    console.log("Patched _contextify in bundle5.js");
  }
  if (content.includes(oldAbsolutify)) {
    content = content.replace(oldAbsolutify, newAbsolutify);
    console.log("Patched _absolutify in bundle5.js");
  }

  content = content.replace(/\.split\("!"\)\.pop\(\)/g, '.replace(/UniGo!/g,"UniGo\\u0001").split("!").pop().replace(/\\u0001/g,"!")');

  const oldSplit = 'const R=v.slice(Xe||rt?2:st?1:0).split(/!+/);';
  const newSplit = 'const R=v.replace(/UniGo!/g,"UniGo\\u0001").slice(Xe||rt?2:st?1:0).split(/!+/).map(s=>s.replace(/\\u0001/g,"!"));';
  if (content.includes(oldSplit)) {
    content = content.replace(oldSplit, newSplit);
    console.log("Patched .split(/!+/) in bundle5.js");
  }

  fs.writeFileSync(bundle5Path, content, "utf8");
}

// 5. Patch next/font google loader extension parsing
const fontLoaderPath = path.join(__dirname, "../node_modules/next/dist/compiled/@next/font/dist/google/loader.js");
if (fs.existsSync(fontLoaderPath)) {
  let content = fs.readFileSync(fontLoaderPath, "utf8");
  const oldFontExt = "const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];";
  const newFontExt = "const ext = (/\\.(woff|woff2|eot|ttf|otf)/.exec(googleFontFileUrl) || [])[1] || 'woff2';";
  if (content.includes(oldFontExt)) {
    content = content.replace(oldFontExt, newFontExt);
    fs.writeFileSync(fontLoaderPath, content, "utf8");
    console.log("Patched fontLoader extension parser in loader.js");
  }
}
