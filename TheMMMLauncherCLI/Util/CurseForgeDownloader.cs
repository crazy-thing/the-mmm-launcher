using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Newtonsoft.Json.Linq;
using TheMMMLauncherCLI.Models;

namespace TheMMMLauncherCLI.Util 
{
    public class CurseForgeDownloader
    {
        private static string apiKey = "$2a$10$PRMYXEXiKwjYUhsefOaeneSfam4VrzBImlKXPfd8d74Jc6Z0XdKPi";
        private static readonly string baseApi = "http://127.0.0.1:3001/example/v1/";
        private static string baseApiUrl = "https://api.curseforge.com/v1/mods/";
        private static string baseModPackDownloadUrl = "https://www.curseforge.com/api/v1/mods";
        private static readonly string modpacksDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "The MMM Launcher", "Minecraft", "Instances");

        public async Task DownloadManifest(string versionId, ModpackModel modpack)
        {
            using (HttpClient client = new HttpClient())
            {
                try
                {
                    HttpResponseMessage res = await client.GetAsync($"{baseApi}/{modpack.id}/versions/{versionId}", HttpCompletionOption.ResponseHeadersRead);
                    VersionModel selectedVersion = modpack.versions.FirstOrDefault(version => version.id == versionId);

                    if (res.IsSuccessStatusCode)
                    {
                        HttpContent content = res.Content;

                        string fileName = res.Content.Headers.ContentDisposition.FileName;
                        string instancePath = Path.Combine(modpacksDir, modpack.id, versionId);

                        if (!Directory.Exists(instancePath))
                        {
                            Directory.CreateDirectory(instancePath);
                        }

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
                                
                                double sizeInDouble = double.Parse(selectedVersion.size);
                                double percentage = ((double)totalBytesRead / sizeInDouble) * 100;
                                Console.WriteLine($"Progress: {percentage:F0}%");
                            }
                        }

                        await ModpackManager.ExtractModpack(filePath, instancePath);
                        await DownloadMods(instancePath, selectedVersion.size);
                        Console.WriteLine($"Version {versionId} downloaded successfully.");
                        ModpackManager.AddVersion(versionId, modpack);
                    }
                    else
                    {
                        Console.WriteLine($"Failed to call the API. Status code: {res.StatusCode}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred: {ex.Message}");
                }
            }
        }

        public async Task DownloadMods(string instancePath, string totalSize)
        {
            try
            {
                string manifestFilePath = $"{instancePath}\\manifest.json";
                string manifestJson = File.ReadAllText(manifestFilePath);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                Manifest manifest = JsonSerializer.Deserialize<Manifest>(manifestJson);

                int totalFiles = manifest.files.Count();
                int processedFiles = 0;

                var downloadTasks = manifest.files.Select(async mod =>
                {
                    try
                    {
                        using (HttpClient client = new HttpClient())
                        {
                            client.DefaultRequestHeaders.Add("Accept", "application/json");
                            client.DefaultRequestHeaders.Add("x-api-key", apiKey);

                            string modDataUrl = $"{baseApiUrl}{mod.projectID}/files/{mod.fileID}";
                            string modInfoUrl = $"{baseApiUrl}{mod.projectID}";
                            HttpResponseMessage res = await client.GetAsync(modDataUrl);
                            HttpResponseMessage res2 = await client.GetAsync(modInfoUrl);

                            string fileName = string.Empty;
                            string classId = string.Empty;
                            if (res.IsSuccessStatusCode)
                            {
                                var resContent = await res.Content.ReadAsStringAsync();
                                JObject jObject = JObject.Parse(resContent);
                                if (jObject["data"] == null)
                                {
                                    Console.WriteLine("data is null");
                                }
                                else
                                {
                                    if (jObject["data"]["fileName"] != null)
                                    {
                                        fileName = jObject["data"]["fileName"].ToString();
                                        
                                        if (res2.IsSuccessStatusCode) {
                                            var res2Content = await res2.Content.ReadAsStringAsync();
                                            JObject jObject2 = JObject.Parse(res2Content);

                                            classId = jObject2["data"]["classId"].ToString();
                                            Console.WriteLine($"CLASSID: {classId}");
                                        }
                                        Console.WriteLine($"Filename: {fileName}");
                                    }
                                    else
                                    {
                                        Console.WriteLine("filename is null");
                                    }

                                    string projId = mod.projectID.ToString();
                                    string fileId = mod.fileID.ToString();
                                    string modDownloadUrl = $"{baseModPackDownloadUrl}\\{projId}\\files\\{fileId}\\download\\";

                                    byte[] fileDownloadedData = await client.GetByteArrayAsync(modDownloadUrl);

                                    if (classId == "12")
                                    {
                                        if (!Directory.Exists($"{instancePath}\\resourcepacks\\"))
                                        {
                                            Directory.CreateDirectory($"{instancePath}\\resourcepacks\\");
                                        }          
                                    }
                                    else
                                    {
                                        if (!Directory.Exists($"{instancePath}\\mods\\"))
                                        {
                                            Directory.CreateDirectory($"{instancePath}\\mods\\");
                                        }                                
                                    }

                                    if (classId == "12" )
                                    {
                                        File.WriteAllBytes($"{instancePath}\\resourcepacks\\{fileName}", fileDownloadedData); 
                                    }
                                    else
                                    {
                                        File.WriteAllBytes($"{instancePath}\\mods\\{fileName}", fileDownloadedData); 
                                    }

                                    Interlocked.Increment(ref processedFiles); // Safely increment processedFiles counter
                                    double progress = (double)processedFiles / totalFiles * 100;
                                    Console.WriteLine($"Progress: {progress:F0}% for {fileName}");
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"An error occurred during download: {ex.Message}");
                    }
                });

                await Task.WhenAll(downloadTasks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during download: {ex.Message}");
            }
        }

    }
}
