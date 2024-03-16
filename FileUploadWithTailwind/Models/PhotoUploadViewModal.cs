namespace FileUploadWithTailwind.Models
{
    public class PhotoUploadViewModal
    {
        public required string PopupTitle { get; set; }
        public required string ContextId { get; set; }
        public required string DestinationFolder { get; set; }
        public required string JavaScriptCallBackFunction { get; set; }
        public required List<PhotoCropBoxDimension> PhotoCropBoxDimensions { get; set;}
    }

    public class PhotoCropBoxDimension
    {
        public int Width { get; set; }
        public int Height { get; set; }

        public PhotoCropBoxDimension(int width, int height)
        {
            Width = width;
            Height = height;
        }
    }
}
