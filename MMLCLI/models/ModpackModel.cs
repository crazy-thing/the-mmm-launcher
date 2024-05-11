using System.Collections.ObjectModel;


namespace MMLCLI.Models
{

    public class VersionModel
    {
        public  string name { get; set; }
        public  string id { get; set; }
        public  string zip { get; set; }
        public  string size { get; set; }
        public  string mcVersion { get; set; }
        public  string modLoader { get; set; }
        public string build { get; set; } 
        public  string modName { get; set; }
        public string ParentModpackName { get; set; }
        public string changelog { get; set; }
        public string InstancePath
        {
            get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "Minecraft", "Instances", ParentModpackName, id); }
        }

    }
    public class ModpackModel
    {        
        public  string id { get; set; }
        public  string name { get; set; }
        public  string description { get; set; }
        public List<string> screenshots {get; set; }
        public ObservableCollection<VersionModel> versions {get; set; } 
        public VersionModel mainVersion { get; set; }
        public  string thumbnail { get; set; }
        public string InstancePath
        {
            get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "Minecraft", "Instances", id); }
        }
    }
}