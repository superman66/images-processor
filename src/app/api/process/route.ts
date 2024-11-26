import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import JSZip from 'jszip';

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
        name: file.name,
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

    // If multiple images, create zip
    const zip = new JSZip();
    processedImages.forEach(img => {
      zip.file(img.name, img.data);
    });

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="processed-images.zip"'
      }
    });

  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: 'Error processing images' },
      { status: 500 }
    );
  }
}
