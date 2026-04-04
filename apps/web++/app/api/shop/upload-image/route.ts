import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    // Get the form data with the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Get admin token from request cookies or headers
    const token = request.cookies.get('admin_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${folder}/${timestamp}-${randomStr}.${extension}`;

    // Create FormData for backend
    const backendFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    backendFormData.append('file', blob, filename);

    // Upload to backend (which uploads to Cloudflare R2)
    const uploadResponse = await fetch(`${API_BASE_URL}/api/uploads/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('Backend upload failed:', error);
      return NextResponse.json(
        { error: 'Upload to storage failed' },
        { status: 500 }
      );
    }

    const uploadData = await uploadResponse.json();

    // Return the R2 URL
    return NextResponse.json({
      url: uploadData.url,
      filename: filename,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
