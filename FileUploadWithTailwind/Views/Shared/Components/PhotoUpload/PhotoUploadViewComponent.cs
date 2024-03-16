using FileUploadWithTailwind.Models;
using Microsoft.AspNetCore.Mvc;

namespace FileUploadWithTailwind.Views.Shared.Components.PhotoUpload
{
    public class PhotoUploadViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(PhotoUploadViewModal parameters)
        {
            return View(parameters);
        }
    }
}
