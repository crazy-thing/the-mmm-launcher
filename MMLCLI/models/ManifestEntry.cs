namespace MMLCLI.Models {
    public class minecraft
    {
        public string version { get; set; }
        public List<ModLoader> modLoaders { get; set; }
    }

    public class ModLoader
    {
        public string id { get; set; }
    }

    public class ManifestEntry
    {
        public int projectID { get; set; }
        public int fileID { get; set; }
    }

    public class Manifest
    {
        public List<ManifestEntry> files { get; set; }
        public minecraft minecraft { get; set; }
    }
}
