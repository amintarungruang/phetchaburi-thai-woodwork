import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-matroska'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'projects';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' },
        { status: 400 }
      );
    }

    const safeFolder = folder.replace(/[^a-z0-9_-]/gi, '') || 'projects';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    
    let canWriteToDisk = true;
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
    } catch (err) {
      console.warn('Read-only filesystem detected on uploadDir, using Data URL fallback:', err);
      canWriteToDisk = false;
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: `ไฟล์ "${file.name}" ไม่ใช่ชนิดไฟล์ที่รองรับ (รองรับรูปภาพ JPG, PNG, WEBP, GIF หรือวิดีโอ MP4, WEBM, MOV)` },
          { status: 400 }
        );
      }

      // Size check
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `ไฟล์รูปภาพ "${file.name}" มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 15MB ต่อรูป)` },
          { status: 400 }
        );
      }
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: `ไฟล์วิดีโอ "${file.name}" มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 60MB ต่อคลิป)` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (canWriteToDisk) {
        try {
          const ext = path.extname(file.name).toLowerCase() || (isVideo ? '.mp4' : '.jpg');
          const safeRandom = Math.random().toString(36).substring(2, 8);
          const prefix = isVideo ? 'vid' : 'img';
          const filename = `${prefix}-${Date.now()}-${safeRandom}${ext}`;
          const filepath = path.join(uploadDir, filename);

          await writeFile(filepath, buffer);
          uploadedUrls.push(`/uploads/${safeFolder}/${filename}`);
          continue;
        } catch (writeErr) {
          console.warn('Disk write failed (e.g. Vercel read-only), falling back to Data URL:', writeErr);
          canWriteToDisk = false;
        }
      }

      // Serverless Read-only Fallback (e.g. Vercel)
      const mime = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');
      const base64 = buffer.toString('base64');
      uploadedUrls.push(`data:${mime};base64,${base64}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'URL ไฟล์ไม่ถูกต้องหรือไม่ได้รับอนุญาตให้ลบ' },
        { status: 400 }
      );
    }

    const cleanPath = url.replace(/^\//, '').split('/');
    const filepath = path.join(process.cwd(), 'public', ...cleanPath);

    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบไฟล์' },
      { status: 500 }
    );
  }
}
