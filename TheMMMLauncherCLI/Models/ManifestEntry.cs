public class ManifestEntry
{
    public int projectID { get; set; }
    public int fileID { get; set; }
}

public class Manifest
{
    public List<ManifestEntry> files { get; set; }

}