import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

async function setupJdk() {
  const javaCheck = spawnSync("java", ["-version"]);
  const javacCheck = spawnSync("javac", ["-version"]);

  if (!javaCheck.error && !javacCheck.error) {
    console.log("✅ Host system already has native Java and javac available.");
    return;
  }

  const jdkDir = path.resolve(process.cwd(), ".jdk");
  if (fs.existsSync(path.join(jdkDir, "bin", "java")) && fs.existsSync(path.join(jdkDir, "bin", "javac"))) {
    console.log("✅ Local OpenJDK bundle already present at .jdk/");
    return;
  }

  if (process.platform !== "linux") {
    console.log("ℹ️ Local development on non-Linux; system Java should be used if installed.");
    return;
  }

  console.log("📥 Setting up portable OpenJDK 17 for Linux environment...");
  try {
    fs.mkdirSync(jdkDir, { recursive: true });
    const url = "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse";
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      console.warn("⚠️ Adoptium returned status " + res.status);
      return;
    }

    const tarPath = path.join(jdkDir, "jdk.tar.gz");
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(tarPath, Buffer.from(arrayBuffer));

    console.log("📦 Extracting OpenJDK 17 into .jdk/...");
    spawnSync("tar", ["-xzf", tarPath, "--strip-components=1", "-C", jdkDir]);
    try { fs.unlinkSync(tarPath); } catch {}

    const verify = spawnSync(path.join(jdkDir, "bin", "java"), ["-version"]);
    if (!verify.error) {
      console.log("✅ OpenJDK 17 setup complete.");
    }
  } catch (err) {
    console.warn("⚠️ Automated OpenJDK setup encountered a warning:", err?.message || err);
  }
}

setupJdk();
