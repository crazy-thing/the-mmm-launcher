using System.Text.Json;
using MMLCLI.Models;
using MMLCLI.Helpers;
using Newtonsoft.Json.Linq;
using MMLCLI.Util;
using System.Runtime.InteropServices;

namespace MMLCLI.Core {
    public class Downloader
    {
        private static string apiKey = "$2a$10$PRMYXEXiKwjYUhsefOaeneSfam4VrzBImlKXPfd8d74Jc6Z0XdKPi";
        private static readonly string baseApi = "https://minecraftmigos.me/example/v1/";
        private static string baseApiUrl = "https://api.curseforge.com/v1/mods/";
        private static string baseModPackDownloadUrl = "https://www.curseforge.com/api/v1/mods";
        private static readonly string modpacksDir;

        static Downloader()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                modpacksDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Library", "Application Support", "MML", "Minecraft", "Instances");
            }
            else
            {
                modpacksDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "Minecraft", "Instances");
            }
        }        public async Task DownloadManifest(ModpackModel modpack)
        {
            try 
            {
                using (HttpClient client = new HttpClient())
                {
                    var apiUrl = $"{baseApi}/{modpack.id}/";
                    Console.WriteLine(apiUrl);
                    HttpResponseMessage res = await client.GetAsync($"{baseApi}/{modpack.id}/", HttpCompletionOption.ResponseHeadersRead);

                    if (res.IsSuccessStatusCode)
                    {
                        HttpContent content = res.Content;

                        Console.WriteLine(modpack.mainVersion.zip);
                        string fileName = modpack.mainVersion.zip;
                        string instancePath = Path.Combine(modpacksDir, modpack.id);

                        Directory.CreateDirectory(instancePath); 

                        string filePath = Path.Combine(instancePath, fileName);
                        Console.WriteLine(filePath);

                        using (Stream stream = await content.ReadAsStreamAsync())
                        using (FileStream fileStream = File.Create(filePath))
                        {
                            byte[] buffer = new byte[8192];
                            int bytesRead;
                            long totalBytesRead = 0;

                            while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                            {
                                await fileStream.WriteAsync(buffer, 0, bytesRead);
                                totalBytesRead += bytesRead;

                                double sizeInDouble = double.Parse(modpack.mainVersion.size);
                                double percentage = Math.Min(100, (totalBytesRead / sizeInDouble) * 100);
                                Console.WriteLine($"Modpack Progress: {percentage:F0}%");
                            }
                        }

                        string extractedPath = Path.Combine(instancePath);
                        await Extract.ExtractModpack(filePath, extractedPath, instancePath);

                        var manifest = await DownloadMods(instancePath, modpack.mainVersion.size);
                        Console.WriteLine($"Modpack {modpack.id} downloaded successfully.");

                        ModpackManager.AddModpack(modpack, manifest);
                    }
                    else
                    {
                        Console.WriteLine($"Failed to call the API. Status code: {res.StatusCode}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred downloading manifest: {ex}");
            }
        }
        
        
        public async Task<Manifest> DownloadMods(string instancePath, string totalSize)
        {
            try
            {
                string manifestFilePath = Path.Combine(instancePath, "manifest.json");
                string manifestJson = await File.ReadAllTextAsync(manifestFilePath);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                Manifest manifest = JsonSerializer.Deserialize<Manifest>(manifestJson);

                int totalFiles = manifest.files.Count();
                int processedFiles = 0;

                using HttpClient client = new HttpClient
                {
                    Timeout = TimeSpan.FromMinutes(10)
                };
                client.DefaultRequestHeaders.Add("Accept", "application/json");
                client.DefaultRequestHeaders.Add("x-api-key", apiKey);

                int maxDegreeOfParallelism = 30;
                var semaphore = new SemaphoreSlim(maxDegreeOfParallelism);

                var downloadTasks = manifest.files.Select(async mod =>
                {
                    await semaphore.WaitAsync();
                    try
                    {
                        string modDataUrl = $"{baseApiUrl}{mod.projectID}/files/{mod.fileID}";
                        string modInfoUrl = $"{baseApiUrl}{mod.projectID}";

                        using HttpResponseMessage res = await client.GetAsync(modDataUrl, HttpCompletionOption.ResponseHeadersRead);
                        using HttpResponseMessage res2 = await client.GetAsync(modInfoUrl, HttpCompletionOption.ResponseHeadersRead);

                        string fileName = string.Empty;
                        string classId = string.Empty;
                        if (res.IsSuccessStatusCode)
                        {
                            var resContent = await res.Content.ReadAsStringAsync();
                            JObject jObject = JObject.Parse(resContent);

                            if (jObject["data"] != null && jObject["data"]["fileName"] != null)
                            {
                                fileName = jObject["data"]["fileName"].ToString();
                                if (res2.IsSuccessStatusCode)
                                {
                                    var res2Content = await res2.Content.ReadAsStringAsync();
                                    JObject jObject2 = JObject.Parse(res2Content);
                                    classId = jObject2["data"]["classId"]?.ToString();
                                }

                                string projId = mod.projectID.ToString();
                                string fileId = mod.fileID.ToString();
                                string modDownloadUrl = $"{baseModPackDownloadUrl}\\{projId}\\files\\{fileId}\\download\\";

                                using var fileDownloadedStream = await client.GetStreamAsync(modDownloadUrl);

                                string destinationDirectory = classId == "12"
                                    ? Path.Combine(instancePath, "resourcepacks")
                                    : Path.Combine(instancePath, "mods");

                                Directory.CreateDirectory(destinationDirectory);
                                string destinationPath = Path.Combine(destinationDirectory, fileName);

                                using var fileStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None);
                                await fileDownloadedStream.CopyToAsync(fileStream);

                                Interlocked.Increment(ref processedFiles);
                                double progress = (double)processedFiles / totalFiles * 100;
                                Console.WriteLine($"Mod Progress: {progress:F0}% for {fileName}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"An error occurred during download: {ex.Message}");
                    }
                    finally
                    {
                        semaphore.Release();
                    }
                });

                await Task.WhenAll(downloadTasks);
                return manifest;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during download: {ex.Message}");
                return null;
            }
        }
    }
}