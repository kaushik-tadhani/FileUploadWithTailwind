namespace FileUploadWithTailwind.Models
{
    public class PhotoUploadViewModal
    {
        public required string PopupTitle { get; set; }
        public required string ContextId { get; set; }
        public required string DestinationFolder { get; set; }
        public required string JavaScriptCallBackFunction { get; set; }
    }
}
