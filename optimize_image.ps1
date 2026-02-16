
Add-Type -AssemblyName System.Drawing
$sourcePath = "d:\Event2\public\background-1.png"
$destPath = "d:\Event2\public\mobile-background.jpg"

if (Test-Path $sourcePath) {
    try {
        $img = [System.Drawing.Image]::FromFile($sourcePath)
        $newWidth = 1080 
        $newHeight = [int]($img.Height * ($newWidth / $img.Width))
        $newImg = new-object System.Drawing.Bitmap($newWidth, $newHeight)
        $graph = [System.Drawing.Graphics]::FromImage($newImg)
        $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85)
        
        $newImg.Save($destPath, $codec, $encoderParams)
        
        Write-Host "Image resized and saved to $destPath"
    } catch {
        Write-Error "Error resizing image: $_"
    } finally {
        if ($img) { $img.Dispose() }
        if ($newImg) { $newImg.Dispose() }
        if ($graph) { $graph.Dispose() }
    }
} else {
    Write-Error "Source image not found: $sourcePath"
}
