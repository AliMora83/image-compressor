
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();

    let processedImage;
    if (metadata.format === "png") {
      processedImage = await sharp(buffer)
        .png({
          quality: 90,
          compressionLevel: 6,
          palette: true,
        })
        .toBuffer();
    } else {
      processedImage = await sharp(buffer)
        .jpeg({
          quality: 55,
          mozjpeg: true,
        })
        .toBuffer();
    }

    return new NextResponse(processedImage, {
      headers: {
        "Content-Type": file.type,
        "Content-Length": processedImage.length.toString(),
      },
    });
  } catch (error) {
    console.error("Compression error:", error);
    return NextResponse.json(
      { error: "Error processing image" },
      { status: 500 }
    );
  }
}
