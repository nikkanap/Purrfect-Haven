# Note on usage of pet images
Vite does not compress images by default. Out of the box, it only copies static image assets to the build folder. 

Enable image compression during the build process using plugins like vite-plugin-image-optimizer, vite-plugin-vsharp, or vite-imagetools, which reduce file sizes using tools like Sharp.