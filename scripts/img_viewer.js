function enableClickToZoom() { 
    // find all imgs
    const fullPage = document.querySelector('#full_page_img_container');
    const imgs = document.querySelectorAll('.clickable_img')
    imgs.forEach(img => {
        img.addEventListener('click', function() {
        fullPage.style.backgroundImage = 'url(' + img.src + ')';
        fullPage.style.display = 'block';
        });
    });
}
enableClickToZoom();