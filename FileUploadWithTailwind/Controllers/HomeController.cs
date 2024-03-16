using FileUploadWithTailwind.Models;
using Microsoft.AspNetCore.Mvc;

namespace FileUploadWithTailwind.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult SaveImage([FromBody] SaveImageRequestModel request)
        {
            // Convert the data URL to a byte array
            var imageBytes = Convert.FromBase64String(request.ImageDataUrl.Split(',')[1]);

            // Extract the image format from the data URL
            string format = request.ImageDataUrl.Split(';')[0].Split('/')[1];

            string fileName = string.Format("{0}.{1}", DateTime.Now.ToString("MM-dd-yyyy-HH-mm-ss"), format);

            // Save the image bytes to a file with the specified path
            var filePath = request.FilePath + fileName;
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                stream.Write(imageBytes, 0, imageBytes.Length);
            }

            return Ok();
        }
    }
}
