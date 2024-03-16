const ImageUploader = (function () {
    let isImageEditEnabled = false;
    let initialImage;
    let lastUpdatedImage;
    let cropper;
    let currentCropperBoxWidth;
    let currentCropperBoxHeight;
    let currentSearchedImageSelectedUrl;

    let fileUploadModal;
    let btn;
    let fileUploadSection;
    let uploadBtn;
    let fileEditSection;
    let btnNext;
    let fileUploadContainer;
    let btnSearchImages;
    let searchedImageContainer;
    let imageEditButtonContainer;
    let imageActionButtonContainer;
    let cropBoxDropdown;
    let cropBoxDropdownOptions;
    let input;
    let fileEditPreview;
    let fileUploadPreview;
    let destinationFolder;
    
    const googleImageCardTemplate = `
    <div class="rounded-lg bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-white md:max-w-xl md:flex-row me-2 mb-2" style="width:10rem; height: 10rem">
            <a href="#"><img class="rounded-lg searched-image" src="IMAGE_URL" style="max-height: 100%; padding: 2px"></a>
    </div>`;

    function initializeVariables(modalContextId, defaultCropBoxWidth, defaultCropBoxHeight, destinationFolder) {
        fileUploadModal = document.getElementById(modalContextId);
        currentCropperBoxWidth = defaultCropBoxWidth;
        currentCropperBoxHeight = defaultCropBoxHeight;
        btn = fileUploadModal.querySelector('#btnOpenWithAllParams');

        fileUploadSection = fileUploadModal.querySelector('#fileUploadWrapper');
        uploadBtn = fileUploadModal.querySelector('#btn-upload');
        fileEditSection = fileUploadModal.querySelector('#fileEditWrapper');

        btnNext = fileUploadModal.querySelector('#btn-next');
        fileUploadContainer = fileUploadModal.querySelector("#file-upload-container");
        btnSearchImages = fileUploadModal.querySelector('#buttonSearchImages');
        searchedImageContainer = fileUploadModal.querySelector('#searchedImageContainer');
        imageEditButtonContainer = fileUploadModal.querySelector('#image-edit-button-container');
        imageActionButtonContainer = fileUploadModal.querySelector("#image-action-button-container");
        cropBoxDropdown = fileUploadModal.querySelector('#cropBoxDropdown');
        cropBoxDropdownOptions = fileUploadModal.querySelectorAll('.crop-box-dropdown-options');
        input = fileUploadModal.querySelector("#file-upload");
        fileEditPreview = fileUploadModal.querySelector('.file-edit-preview');
        fileUploadPreview = fileUploadModal.querySelector('.file-upload-preview');
        this.destinationFolder = destinationFolder
    }

    // Private functions
    function handleImageEditClick() {
        imageEditButtonContainer.classList.add("hidden");
        imageActionButtonContainer.classList.remove('hidden');
        isImageEditEnabled = true;

        initiCropperObject(fileEditPreview, fileEditPreview.querySelector('img').src);
    }

    function handleImageResetClick() {
        initiCropperObject(fileEditPreview, initialImage);
    }

    function handleCropBoxDropdownClick() {
        cropBoxDropdown.classList.toggle('hidden');
    }

    function handleCropBoxOptionClick(e) {
        currentCropperBoxWidth = e.target.dataset.cropboxwidth;
        currentCropperBoxHeight = e.target.dataset.cropboxheight;
        cropBoxDropdownButton.querySelector("span").innerHTML = e.target.innerHTML;
        cropBoxDropdown.classList.toggle('hidden');
        cropper.setAspectRatio(currentCropperBoxWidth / currentCropperBoxHeight);
        cropper.setCropBoxData({ width: currentCropperBoxWidth, height: currentCropperBoxHeight });
    }

    function handleCropClick() {
        isImageEditEnabled = false;
        lastUpdatedImage = cropper.getCroppedCanvas({ width: currentCropperBoxWidth, height: currentCropperBoxHeight }).toDataURL(); 
        initiCropperObject(fileEditPreview, lastUpdatedImage);
        imageEditButtonContainer.classList.remove("hidden");
        imageActionButtonContainer.classList.add('hidden');
    }

    function handleCancelEditClick() {
        isImageEditEnabled = false;
        initiCropperObject(fileEditPreview, lastUpdatedImage || initialImage);
        imageEditButtonContainer.classList.remove("hidden");
        imageActionButtonContainer.classList.add('hidden');
    }

    function handleUploadClick() {
        uploadImage(lastUpdatedImage);
    }

    function handleSearchImagesClick() {
        searchImages(document.getElementById("txtImageSearchKeyword").value).then((links) => {
            searchedImageContainer.innerHTML = links.map(link => googleImageCardTemplate.replace("IMAGE_URL", link)).join('');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.target.style.borderColor = "rgba(164, 37, 228)";
    }

    function handleDragLeave(e) {
        e.target.style.borderColor = "#c6c6c6";
    }

    function handleDrop(e) {
        e.preventDefault();
        e.target.style.borderColor = "#c6c6c6";
        previewFile(e.dataTransfer.files);
    }

    function handleChange(e) {
        e.stopPropagation();
        const files = e.target.files;
        previewFile(files);
    }

    function previewFile(files) {
        if (!files) return;
        fileUploadContainer.classList.add("hidden");
        for (const file of files) {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    initialImage = event.target.result;
                    loadImageToCropper('.file-upload-preview', event.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    async function searchImages(query) {
        const apiKey = 'AIzaSyBnMeVkfzCxtWdCjNBmt5RkEMVFxL4SGvQ'; // Replace with your API key
        const searchEngineId = 'e1539b4f25fee4390'; // Replace with your Engine ID

        const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${searchEngineId}&key=${apiKey}&searchType=image`);

        const data = await response.json();
        console.log(data);
        return data.items.map((item) => item.link);
    }

    function loadImageToCropper(containerId, imgSrc) {
        const imageContainer = document.querySelector(containerId);
        imageContainer.innerHTML = `<img src="${imgSrc}" class="rounded-lg" style="max-height: 100%; padding: 2px">`;
    }

    function initiCropperObject(element, imgSrc) {
        if (cropper && cropper.destroy) {
            cropper.destroy();
            cropper = null;
        }
        element.innerHTML = `<img src="${imgSrc}" class="rounded-lg" style="max-height: 100%; padding: 2px">`;
        if (!isImageEditEnabled) return;
        cropper = new Cropper(element.querySelector('img'), {
            aspectRatio: currentCropperBoxWidth / currentCropperBoxHeight,
            viewMode: 1,
            cropBoxMovable: true,
            cropBoxResizable: false,
            dragMode: 'move',
            built: () => {
                cropper.setCropBoxData({ width: currentCropperBoxWidth, height: currentCropperBoxHeight });
            }
        });
    }

    function uploadImage(imageDataUrl) {
        let filePath = this.destinationFolder;
        fetch('/Home/SaveImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageDataUrl, filePath })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save image');
                }
                fileUploadModal.classList.add('hidden');
                fileUploadPreview.innerHTML = '';
                fileEditPreview.innerHTML = '';
                fileUploadContainer.classList.remove("hidden");
                fileUploadSection.classList.remove("hidden");
                fileEditSection.classList.add("hidden");
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Public API
    return {
        init: function (modalContextId, defaultCropBoxWidth, defaultCropBoxHeight, destinationFolder) {
            initializeVariables(modalContextId, defaultCropBoxWidth, defaultCropBoxHeight, destinationFolder);

            document.addEventListener('click', (event) => {
                if (event.target.classList && event.target.classList.contains('searched-image')) {
                    document.querySelectorAll(".searched-image").forEach(img => {
                        img.classList.remove('border-doubled', 'border-2', 'border-blue-600');
                    });
                    event.target.classList.add('border-doubled', 'border-2', 'border-blue-600');
                    currentSearchedImageSelectedUrl = event.target.src;
                }
            });

            btnNext.onclick = async () => {
                fileUploadSection.classList.add("hidden");
                fileEditSection.classList.remove("hidden");

                if (!initialImage && !currentSearchedImageSelectedUrl) return;

                if (!initialImage && currentSearchedImageSelectedUrl) initialImage = await getDataUrl(currentSearchedImageSelectedUrl);

                loadImageToCropper('.file-edit-preview', initialImage)
            };

            imageEditButtonContainer.querySelector("#btnImageEdit").addEventListener('click', handleImageEditClick);

            imageEditButtonContainer.querySelector("#btnImageReset").addEventListener('click', handleImageResetClick);

            cropBoxDropdownButton.addEventListener('click', handleCropBoxDropdownClick);

            cropBoxDropdownOptions.forEach(option => {
                option.addEventListener("click", handleCropBoxOptionClick);
            });

            document.getElementById('crop').addEventListener('click', handleCropClick);

            document.getElementById("btnCancelEdit").addEventListener("click", handleCancelEditClick);

            uploadBtn.onclick = handleUploadClick;

            btnSearchImages.onclick = handleSearchImagesClick;

            document.addEventListener('dragover', handleDragOver);
            document.addEventListener('dragleave', handleDragLeave);
            document.addEventListener('drop', handleDrop);
            document.addEventListener('change', (event) => {
                if (event.target.matches("input[type='file']")) {
                    handleChange(event);
                }
            });
        },
        open: function () {
            fileUploadModal.classList.remove("hidden");
        }
    };
});

// Initialize the library
