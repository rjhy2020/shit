import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "assets/characters/reker.png",
  "assets/characters/yanlecun.png",
  "assets/characters/sam.png",
  "assets/characters/amodei.png",
  "assets/characters/musk.png",
];

for (const file of requiredFiles) {
  const absolute = join(root, file);
  assert.ok(existsSync(absolute), `${file} should exist`);
  assert.ok(statSync(absolute).size > 1000, `${file} should not be empty`);
}

const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "styles.css"), "utf8");
const js = readFileSync(join(root, "app.js"), "utf8");

for (const id of [
  "game-root",
  "scene-title",
  "speaker-name",
  "dialogue-text",
  "choice-panel",
  "terminal-input",
  "special-stat",
  "safety-stat",
  "credits-stat",
  "open-stat",
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `index.html should expose #${id}`);
}

for (const name of ["레커", "얀르쿤", "샘", "아모데이", "머스끄"]) {
  assert.match(js, new RegExp(name), `app.js should include ${name}`);
}

for (const ending of [
  "2045년 동창회",
  "물리실의 기적",
  "Enterprise 결혼식",
  "안전 등급 V 획득",
  "화성 수학여행",
  "커뮤니티 노트 맞고 산화",
]) {
  assert.match(js, new RegExp(ending), `app.js should include ending: ${ending}`);
}

for (const event of ["GPT-5.5", "Mythos", "Colossus", "Grok Build"]) {
  assert.match(js, new RegExp(event), `app.js should include event: ${event}`);
}

assert.match(js, /deadline|timer|remainingTime|timeLeft/, "mini-game should track a timer");
assert.match(js, /function startGame|addEventListener\("click", startGame\)/, "start button should use explicit startGame flow");
assert.match(js, /scrollIntoView/, "start flow should scroll the play screen into view");
assert.match(html, /styles\.css\?v=/, "stylesheet should be cache-busted for Chrome refreshes");
assert.match(html, /app\.js\?v=/, "script should be cache-busted for Chrome refreshes");
assert.match(js, /startDialogueSequence|advanceDialogue/, "dialogue should advance in short VN-style lines");
assert.match(js, /나는 게이야/, "Sam route should include the requested gay character detail");
assert.match(css, /@media\s*\(/, "styles.css should include responsive rules");
assert.match(css, /animation|transition/, "styles.css should include motion");
assert.match(css, /portrait-layer/, "styles.css should position portraits separately from the dialogue box");
