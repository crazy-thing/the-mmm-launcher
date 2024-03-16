using System.Collections.ObjectModel;
using System.Text.Json.Serialization;

namespace TheMMMLauncherCLI.Models
{

    public class VersionModel
    {
        public  string name { get; set; }
        public  string id { get; set; }
        public  string zip { get; set; }
        public  string size { get; set; }
        public  string mcVersion { get; set; }
        public  string modLoader { get; set; }
        public  string modName { get; set; }

        public string ParentModpackName { get; set; }

        public string InstancePath
        {
            get { return AppDomain.CurrentDomain.BaseDirectory + "Minecraft\\Instances\\" + ParentModpackName + "\\" + name; }
        }

    }
    public class ModpackModel
    {        
        public  string id { get; set; }
        public  string name { get; set; }
        public  string description { get; set; }
        public ObservableCollection<VersionModel> versions { get; set; }
        public  string thumbnail { get; set; }
    }
}