import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Add suffix to filename before extension
function addSuffixToFilename(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return `${filename}-processed`;
  return `${filename.substring(0, lastDotIndex)}-processed${filename.substring(lastDotIndex)}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const processedImages: { name: string; data: Buffer }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Process image with sharp
      const image = sharp(buffer);
    
      
      // Trim transparent pixels
      const trimmedImage = await image.trim().toBuffer();
      
      processedImages.push({
        name: addSuffixToFilename(file.name),
        data: trimmedImage
      });
    }

    // If single image, return directly
    if (processedImages.length === 1) {
      return new NextResponse(processedImages[0].data, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${processedImages[0].name}"`
        }
      });
    }

    // If multiple images, return array of base64 encoded images
    const imagesData = processedImages.map(img => ({
      name: img.name,
      data: img.data.toString('base64')
    }));

    return NextResponse.json(imagesData);

  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: 'Error processing images' },
      { status: 500 }
    );
  }
}
