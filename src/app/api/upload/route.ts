import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs'; // ต้องเป็น Node runtime เพื่อใช้ Buffer

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll('files') as File[];

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files' }), { status: 400 });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'tripdiary';

    const results = await Promise.all(
      files.map(async (file) => {
        const ab = await file.arrayBuffer();
        const buffer = Buffer.from(ab);

        const uploaded: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(buffer);
        });

        return {
          id: uploaded.public_id as string,
          url: uploaded.secure_url as string,
          width: uploaded.width as number,
          height: uploaded.height as number,
          mime: file.type,
        };
      })
    );

    return Response.json({ images: results });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message || 'Upload failed' }), { status: 500 });
  }
}
