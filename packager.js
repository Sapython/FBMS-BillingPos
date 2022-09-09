const electronInstaller = require("electron-winstaller");
async function build() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: "Viraj-Billing Pos-win32-x64",
      outputDirectory: "/tmp/build/installer64",
      authors: "Shreeva SoftTech",
      description: "Viraj Billing Pos",
      exe: "Viraj-Billing Pos.exe",
      version:'1.0.0',
    });
    console.log("It worked!");
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }
}

build();