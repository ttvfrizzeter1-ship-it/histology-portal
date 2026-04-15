Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$W,
    [float]$H,
    [float]$R
  )
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $R * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-CoverImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image,
    [int]$TargetW,
    [int]$TargetH
  )
  $srcW = $Image.Width
  $srcH = $Image.Height
  $srcRatio = $srcW / $srcH
  $dstRatio = $TargetW / $TargetH

  if ($srcRatio -gt $dstRatio) {
    $cropH = $srcH
    $cropW = [int]($srcH * $dstRatio)
    $cropX = [int](($srcW - $cropW) / 2)
    $cropY = 0
  } else {
    $cropW = $srcW
    $cropH = [int]($srcW / $dstRatio)
    $cropX = 0
    $cropY = [int](($srcH - $cropH) / 2)
  }

  $dstRect = New-Object System.Drawing.Rectangle(0, 0, $TargetW, $TargetH)
  $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
  $Graphics.DrawImage($Image, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

$root = Split-Path -Parent $PSScriptRoot
$slidesDir = Join-Path $root "client\public\slides"
$outDir = Join-Path $root "client\public\topic-banners"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$topics = @(
  @{ file = "epithelial.jpg"; title = "Epithelial Tissue"; subtitle = "Covering and glandular cells. Barrier, secretion, transport."; slide = "slide0.jpg"; color = [System.Drawing.Color]::FromArgb(255, 248, 187, 208) },
  @{ file = "connective.jpg"; title = "Connective Tissue"; subtitle = "Connective proper, cartilage, and bone. Support and trophic functions."; slide = "slide2.jpg"; color = [System.Drawing.Color]::FromArgb(255, 196, 224, 255) },
  @{ file = "muscle.jpg"; title = "Muscle Tissue"; subtitle = "Smooth, striated, and cardiac muscle. Contraction and movement."; slide = "slide6.jpg"; color = [System.Drawing.Color]::FromArgb(255, 255, 210, 170) },
  @{ file = "nervous.jpg"; title = "Nervous Tissue"; subtitle = "Neurons, glia, and synapses. Signal conduction and integration."; slide = "slide7.png"; color = [System.Drawing.Color]::FromArgb(255, 198, 180, 255) },
  @{ file = "blood-lymph.jpg"; title = "Blood and Lymph"; subtitle = "Formed elements, plasma, and immune microenvironment."; slide = "slide4.jpg"; color = [System.Drawing.Color]::FromArgb(255, 255, 184, 196) },
  @{ file = "cardiovascular.jpg"; title = "Cardiovascular System"; subtitle = "Histology of heart and vessels: endocardium, myocardium, vessel wall."; slide = "slide5.jpg"; color = [System.Drawing.Color]::FromArgb(255, 255, 198, 220) },
  @{ file = "digestive.jpg"; title = "Digestive System"; subtitle = "Wall layers of digestive organs, glands, and mucosal epithelium."; slide = "slide1.jpg"; color = [System.Drawing.Color]::FromArgb(255, 255, 230, 190) }
)

$W = 1600
$H = 900

$titleFontPath = "C:\Windows\Fonts\seguisb.ttf"
$bodyFontPath = "C:\Windows\Fonts\segoeui.ttf"
$smallFontPath = "C:\Windows\Fonts\segoeui.ttf"

$titleFont = New-Object System.Drawing.Text.PrivateFontCollection
$bodyFont = New-Object System.Drawing.Text.PrivateFontCollection
$smallFont = New-Object System.Drawing.Text.PrivateFontCollection
$titleFont.AddFontFile($titleFontPath)
$bodyFont.AddFontFile($bodyFontPath)
$smallFont.AddFontFile($smallFontPath)

foreach ($t in $topics) {
  $srcPath = Join-Path $slidesDir $t.slide
  $dstPath = Join-Path $outDir $t.file

  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $img = [System.Drawing.Image]::FromFile($srcPath)
  Draw-CoverImage -Graphics $g -Image $img -TargetW $W -TargetH $H

  $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(88, 22, 8, 28))
  $g.FillRectangle($overlay, 0, 0, $W, $H)

  $gradRect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $gradRect,
    [System.Drawing.Color]::FromArgb(95, 10, 4, 14),
    [System.Drawing.Color]::FromArgb(30, 10, 4, 14),
    35
  )
  $g.FillRectangle($grad, 0, 0, $W, $H)

  $panelX = 70
  $panelY = 515
  $panelW = 1460
  $panelH = 300
  $panelPath = New-RoundedRectPath -X $panelX -Y $panelY -W $panelW -H $panelH -R 28
  $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(142, 12, 10, 22))
  $panelBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 255, 255), 2)
  $g.FillPath($panelBrush, $panelPath)
  $g.DrawPath($panelBorder, $panelPath)

  $badgePath = New-RoundedRectPath -X 70 -Y 60 -W 300 -H 62 -R 18
  $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 18, 10, 32))
  $badgeBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, $t.color.R, $t.color.G, $t.color.B), 2)
  $g.FillPath($badgeBrush, $badgePath)
  $g.DrawPath($badgeBorder, $badgePath)

  $badgeFontObj = New-Object System.Drawing.Font($smallFont.Families[0], 25, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $badgeTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, $t.color.R, $t.color.G, $t.color.B))
  $g.DrawString("HISTOLOGY", $badgeFontObj, $badgeTextBrush, 92, 76)

  $titleFontObj = New-Object System.Drawing.Font($titleFont.Families[0], 74, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $titleShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 0, 0, 0))
  $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 250, 246, 255))
  $g.DrawString($t.title, $titleFontObj, $titleShadow, 88, 545)
  $g.DrawString($t.title, $titleFontObj, $titleBrush, 84, 540)

  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, $t.color.R, $t.color.G, $t.color.B), 5)
  $g.DrawLine($linePen, 88, 648, 570, 648)

  $subFontObj = New-Object System.Drawing.Font($bodyFont.Families[0], 40, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238, 245, 239, 255))
  $subRect = New-Object System.Drawing.RectangleF(84, 668, 1400, 130)
  $stringFormat = New-Object System.Drawing.StringFormat
  $stringFormat.Alignment = [System.Drawing.StringAlignment]::Near
  $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Near
  $g.DrawString($t.subtitle, $subFontObj, $subBrush, $subRect, $stringFormat)

  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 94L)
  $bmp.Save($dstPath, $encoder, $encoderParams)

  $img.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

Write-Host "Generated:" (Get-ChildItem $outDir | Select-Object -ExpandProperty Name)
