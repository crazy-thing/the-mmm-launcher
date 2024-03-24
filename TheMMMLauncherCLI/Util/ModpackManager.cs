using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO.Compression;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using TheMMMLauncherCLI.Launcher;
using TheMMMLauncherCLI.Models;

namespace TheMMMLauncherCLI.Util
{
    public class ModpackManager
    {
        private static readonly string modpacksDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "The MMM Launcher", "Minecraft", "Instances");
        private static string modpacksJsonFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "The MMM Launcher", "modpacks.json");
        private static readonly string baseApi = "http://127.0.0.1:3001/example/v1/";
        private static ObservableCollection<ModpackModel> modpacks;
        public bool IsVersionDownloaded(string modpackId)
        {
            string modpackPath = Path.Combine(modpacksDir, modpackId);
            
            return Directory.Exists(modpackPath);
        }
        
        public static async Task ExtractModpack(string filePath, string extractPath)
        {
            try
            {
                using (ZipArchive archive = ZipFile.OpenRead(filePath))
                {
                    long totalBytes = 0;
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        totalBytes += entry.Length;
                    }

                    long extractedBytes = 0;
                    const int bufferSize = 4096;
                    byte[] buffer = new byte[bufferSize];

                    ExtractOverrides(filePath, extractPath);

                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        string destinationPath = Path.Combine(extractPath, entry.FullName);
                        string destinationDirectory = Path.GetDirectoryName(destinationPath);
                        Directory.CreateDirectory(destinationDirectory);

                        if (!entry.FullName.EndsWith("/")) 
                        {
                            using (Stream source = entry.Open())
                            using (FileStream destination = File.Create(destinationPath))
                            {
                                int bytesRead;
                                while ((bytesRead = await source.ReadAsync(buffer, 0, buffer.Length)) > 0)
                                {
                                    await destination.WriteAsync(buffer, 0, bytesRead);
                                    extractedBytes += bytesRead;

                                    double progress = (double)extractedBytes / totalBytes * 100;
                                    Console.WriteLine($"Progress: {progress:F0}%");
                                }
                            }
                        }
                    }
                }
                File.Delete(filePath);
                Directory.Delete(Path.Combine(extractPath, "overrides"), true);

            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during extraction: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
            }
        }

        // Move all overrides into version instance path
        // 
        public static void ExtractOverrides(string zippedPack, string instancePath)
        {
            try
            {
                using (ZipArchive archive = ZipFile.OpenRead(zippedPack))
                {
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        if (entry.FullName.StartsWith("overrides/", StringComparison.OrdinalIgnoreCase))
                        {
                            if (!Directory.Exists(instancePath))
                            {
                                Directory.CreateDirectory(instancePath);
                            }

                            string destinationFilePath = Path.Combine(instancePath, entry.FullName.Substring("overrides/".Length));

                            if (!File.Exists(destinationFilePath))
                            {
                                if (destinationFilePath.Contains("mods") || destinationFilePath.StartsWith("mods\\"))
                                {
                                    Directory.CreateDirectory(Path.GetDirectoryName(destinationFilePath));
                                }
                                else if (destinationFilePath.Contains("config/") || destinationFilePath.StartsWith("config\\"))
                                {
                                    Directory.CreateDirectory(Path.GetDirectoryName(destinationFilePath));
                                }
                                else
                                {
                                    destinationFilePath = Path.Combine(instancePath, entry.FullName.Substring("overrides/".Length));
                                    Directory.CreateDirectory(Path.GetDirectoryName(destinationFilePath));
                                }

                                entry.ExtractToFile(destinationFilePath, false);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }
        }

        public static async void AddVersion(string versionId, ModpackModel modpack)
        {
            try
            {
                Installer installer = new Installer();

                ModpackModel existingModpack = modpacks.FirstOrDefault(mp => mp.id == modpack.id);
                if (existingModpack == null)
                {
                    existingModpack = new ModpackModel
                    {
                        id = modpack.id,
                        name = modpack.name,
                        description = modpack.description,
                        thumbnail = modpack.thumbnail,
                        versions = new ObservableCollection<VersionModel>()
                    };
                    modpacks.Add(existingModpack);
                }

                VersionModel downloadedVersion = modpack.versions.FirstOrDefault(ver => ver.id == versionId);

                if (downloadedVersion != null)
                {
                    downloadedVersion.ParentModpackName = existingModpack.id; 
                    existingModpack.versions.Add(downloadedVersion);
                    SaveModpacks();
                    if (downloadedVersion.modName.ToLower() == "fabric")
                    {
                        await installer.InstallFabricVersion(downloadedVersion);
                    }
                    else if (downloadedVersion.modName.ToLower() == "forge")
                    {
                        await installer.InstallForgeVersion(downloadedVersion);
                    }
                    else
                    {
                        Console.WriteLine("Invalid mod loader name");
                    }
                }
                else
                {
                    Console.WriteLine($"Version {versionId} not found in the downloaded modpack's version array.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred adding version to modpacks.json: ", ex);
            }
        }

        public static void SelectVersion(string modpackId, string versionId)
        {
            try
            {
                ModpackModel modpack = modpacks.FirstOrDefault(mp => mp.id == modpackId);
                if (modpack != null)
                {
                    VersionModel selectedVersion = modpack.versions.FirstOrDefault(ver => ver.id == versionId);
                    if (selectedVersion != null)
                    {
                        string instancePath = selectedVersion.InstancePath;
                        string instanceParentDir = Directory.GetParent(instancePath).FullName;
                        string[] sourceDirs = Directory.GetDirectories(instancePath);

                        foreach (string sourceDir in sourceDirs)
                        {
                            string dirName = Path.GetFileName(sourceDir);
                            string destDir = Path.Combine(instanceParentDir, dirName);

                            if (Directory.Exists(destDir))
                            {
                                Directory.Delete(destDir, true);
                            }

                            CopyDirectory(sourceDir, destDir);
                        }

                        Console.WriteLine($"Selected version {selectedVersion.name} for modpack {modpackId}. \n");
                        Console.WriteLine("version-selected");
                    }
                    else
                    {
                        Console.WriteLine($"Version {versionId} not found in modpack's versions.");
                    }
                }
                else
                {
                    Console.WriteLine($"Modpack {modpackId} not found.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during version selection: {ex.Message}");
            }
        }


        private static void CopyDirectory(string sourceDir, string targetDir)
        {
            Directory.CreateDirectory(targetDir);

            string[] files = Directory.GetFiles(sourceDir);
            int totalFiles = files.Length;
            int copiedFiles = 0;

            foreach (string file in files)
            {
                string dest = Path.Combine(targetDir, Path.GetFileName(file));
                File.Copy(file, dest, true);
                copiedFiles++;
                double progress = (double)copiedFiles / totalFiles * 100;
                Console.WriteLine($"Progress: {progress:F0}%");
            }

            foreach (string subdir in Directory.GetDirectories(sourceDir))
            {
                string destSubDir = Path.Combine(targetDir, Path.GetFileName(subdir));
                CopyDirectory(subdir, destSubDir);
            }
        }

        public static void UninstallVersion(VersionModel version)
        {
            try
            {
                Console.WriteLine("version id " + version.name);
                ModpackModel modpack = modpacks.FirstOrDefault(mp => mp.versions.Any(ver => ver.id == version.id));
                            
                if (modpack != null)
                {
                    VersionModel versionToRemove = modpack.versions.FirstOrDefault(ver => ver.id == version.id);
                    if (versionToRemove != null)
                    {

                        if (Directory.Exists(versionToRemove.InstancePath))
                        {
                            Directory.Delete(versionToRemove.InstancePath, true);
                            Console.WriteLine($"Deleted {versionToRemove} successfully");
                        }
                        else
                        {
                            Console.WriteLine($"Directory {versionToRemove.InstancePath} not found.");
                        }
                        modpack.versions.Remove(versionToRemove);
                        SaveModpacks();
                        Console.WriteLine("uninstall-complete \n");
                    }
                    else
                    {
                        Console.WriteLine($"Version {version.id} not found in modpack.");
                    }
                }
                else
                {
                    Console.WriteLine($"Modpack for version {version.id} not found.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while uninstalling version: {ex.Message}");                
            }
        }

        public static void LoadModpacks()
        {
            if (File.Exists(modpacksJsonFile))
            {
                string jsonData = File.ReadAllText(modpacksJsonFile);
                modpacks = JsonSerializer.Deserialize<ObservableCollection<ModpackModel>>(jsonData);
            }
            else
            {
                modpacks = new ObservableCollection<ModpackModel>();
            }
        }
        public static string CheckForInstalledVersions()
        {
            if (File.Exists(modpacksJsonFile))
            {
                string jsonData = File.ReadAllText(modpacksJsonFile);
                return jsonData;
            }
            else
            {
                Console.WriteLine("no json file");
                return null;
            }
        }
        public static void SaveModpacks()
        {
            try
            {

            if (!Directory.Exists(Path.GetDirectoryName(modpacksJsonFile)))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(modpacksJsonFile));
            }
            string jsonData = JsonSerializer.Serialize(modpacks, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(modpacksJsonFile, jsonData); 
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

    }

}