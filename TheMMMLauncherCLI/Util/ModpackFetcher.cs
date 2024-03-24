using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Text.Json;
using TheMMMLauncherCLI.Models;

namespace TheMMMLauncherCLI.Util
{
    public class ModpackFetcher
    {
        private static string baseApi = "http://127.0.0.1:3001/example/v1/";
        
        public async Task FetchModpacks()
        {
            using (HttpClient client = new HttpClient())
            {
                try
                {
                    HttpResponseMessage res = await client.GetAsync(baseApi);

                    if (res.IsSuccessStatusCode)
                    {
                        string resBody = await res.Content.ReadAsStringAsync();

                        ObservableCollection<ModpackModel> modpackModels = JsonSerializer.Deserialize<ObservableCollection<ModpackModel>>(resBody);

                        
                        foreach ( var model in modpackModels)
                        {
                            Console.WriteLine($"Modpack ID: {model.id}, Modpack Name: {model.name}");
                            foreach (var ver in model.versions)
                            {
                                ver.ParentModpackName = model.name;
                                Console.WriteLine($"Modpack version: {ver.id}  and   {ver.name}    and {ver.InstancePath}");
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Failed to call the API. Status code: {res.StatusCode}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occured: {ex.Message}");
                }
            }
        }
    }
}