<?php
// Fungsi untuk membaca file dari folder
function getImagesFromFolder($folder) {
    $images = [];
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (is_dir($folder)) {
        $files = scandir($folder);
        $id = 1;
        
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($ext, $allowed)) {
                    $images[] = [
                        'id' => $id++,
                        'filename' => $file,
                        'src' => $folder . '/' . $file,
                        'title' => ucfirst(str_replace(['_', '-'], ' ', pathinfo($file, PATHINFO_FILENAME))),
                        'desc' => 'Foto astronomi dari koleksi pribadi'
                    ];
                }
            }
        }
    }
    
    return $images;
}

// Ambil foto dari folder
$images = getImagesFromFolder('src/img');
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Album Astronomi - Baca Folder</title>
    <!-- CSS sama seperti di atas -->
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-star"></i> Album Astronomi</h1>
            <p class="subtitle">Foto otomatis diambil dari folder: <code>src/img</code></p>
            <p class="subtitle">Ditemukan: <strong><?php echo count($images); ?> foto</strong></p>
        </header>
        
        <div class="album-container" id="albumContainer">
            <?php if (count($images) > 0): ?>
                <?php foreach ($images as $photo): ?>
                <div class="photo-item" data-id="<?php echo $photo['id']; ?>" draggable="true">
                    <div class="drag-handle" title="Seret untuk mengatur ulang">
                        <i class="fas fa-arrows-alt"></i>
                    </div>
                    <img src="<?php echo $photo['src']; ?>" alt="<?php echo $photo['title']; ?>">
                    <div class="photo-info">
                        <div class="photo-title">
                            <i class="fas fa-star"></i> <?php echo $photo['title']; ?>
                        </div>
                        <div class="photo-desc"><?php echo $photo['desc']; ?></div>
                        <div class="photo-desc" style="font-size: 0.8rem; margin-top: 5px; color: #8a95ff;">
                            <i class="fas fa-file-image"></i> <?php echo $photo['filename']; ?>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="empty-album">
                    <i class="fas fa-images"></i>
                    <h3>Tidak Ada Foto</h3>
                    <p>Tambahkan foto ke folder <strong>src/img</strong></p>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- JavaScript untuk drag & drop (sama seperti sebelumnya) -->
</body>
</html>
