using CmlLib.Core.Installer.Forge;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.Downloader;
using System.ComponentModel;
using CmlLib.Utils;
using CmlLib.Core.Installer.FabricMC;
using MMLCLI.Models;
using CmlLib.Core.Version;
using System.Runtime.InteropServices;

namespace MMLCLI.Core
{
    public class Installer
    {
        private static string minecraftRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "Minecraft");
        private static string minecraftRootMac = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Library", "Application Support", "MML", "Minecraft");

        private static string runtimePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), ".minecraft", "runtime");
        private static string runtimePathLinux = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".minecraft", "runtime");
        private static string runtimePathMac = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Library", "Application Support", "minecraft", "runtime");


        private MinecraftPath path;
        private CMLauncher launcher;
        public CMLauncher InitializeLauncher(VersionModel version, string? modpackId = null)
        {
            try
            {
                path = new MinecraftPath();
                launcher = new CMLauncher(path);
                launcher.FileChanged += Launcher_FileChanged;


                path.BasePath = Path.Combine(minecraftRoot, "Instances", modpackId ?? string.Empty);

                Console.WriteLine($"Path is {path.Runtime}");

                // For custom install
               /* string baseRoot = RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? minecraftRootMac : minecraftRoot;

                if (!Directory.Exists(baseRoot))
                {
                    Directory.CreateDirectory(baseRoot);
                }


                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    path.Runtime = runtimePath;
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    path.Runtime = runtimePathLinux;
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    path.Runtime = runtimePathMac;
                }

                path.Library = Path.Combine(baseRoot, "libraries");
                path.Resource = Path.Combine(baseRoot, "resources");
                path.Versions = Path.Combine(baseRoot, "versions");
                path.Assets = Path.Combine(baseRoot, "assets");
                */
                return launcher;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }
        }

        public async Task InstallForgeVersion(VersionModel version, string modpackId)
        {
            try
            {
                InitializeLauncher(version, modpackId);
                
                var forge = new MForge(launcher);
                forge.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine($"Loader Progress: {e.ProgressPercentage:F0}% \n");
                };

                Console.WriteLine(version.mcVersion + " " + version.modLoader);
                var versionName = await forge.Install(version.mcVersion, version.modLoader); 
                Console.WriteLine($"Install-Complete {modpackId}");


            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred installing forge version: {ex}");
            }


        }

        public async Task InstallFabricVersion(VersionModel version, string modpackId)
        {
            try
            {
                InitializeLauncher(version, modpackId);
                launcher.FileChanged += (e) =>
                {
                    Console.WriteLine("FileKind: " + e.FileKind.ToString());
                    Console.WriteLine("FileName: " + e.FileName);
                    Console.WriteLine("ProgressedFileCount: " + e.ProgressedFileCount);
                    Console.WriteLine("TotalFileCount: " + e.TotalFileCount);
                };
                launcher.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine($"Loader Progress: {e.ProgressPercentage:F0}");
                };

                var fabricVersionLoader = new FabricVersionLoader
                {
                    LoaderVersion = version.modLoader
                };
                var fabricVersions = await fabricVersionLoader.GetVersionMetadatasAsync();

                var fullName = $"fabric-loader-{version.modLoader}-{version.mcVersion}";
                Console.WriteLine(fullName);
                var fabric = fabricVersions.GetVersionMetadata(fullName);
                await fabric.SaveAsync(path);
                await launcher.GetAllVersionsAsync();
                Console.WriteLine($"Install-Complete {modpackId}");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

        }

        void progressChanged(object? sender, ProgressChangedEventArgs e)
        {
            Console.WriteLine($"{e.ProgressPercentage}%");
        }

        private void Launcher_FileChanged(DownloadFileChangedEventArgs e)
        {
            double progress = ((double)e.ProgressedFileCount / e.TotalFileCount) * 100;
            Console.WriteLine($"LauncherIn Progress: {progress:F0}%");
        }

    }
}