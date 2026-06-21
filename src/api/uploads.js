// NOTE: The backend no longer receives multipart uploads in this flow.
// The frontend uploads media to an external provider (Cloudinary, S3, etc.)
// and then sends only the obtained URLs to the backend. Here we provide a
// small client that simulates an external uploader for development.

const simulateExternalUpload = async (file) => {
  // In a real integration replace this with the external provider SDK or
  // a direct fetch to their upload endpoint.
  // We return a deterministic URL for the uploaded file so the app can
  // continue working without hitting our backend with multipart data.
  const name = file?.name?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
  const url = `https://cdn.example.com/${encodeURIComponent(name)}`;
  // simulate network/upload latency
  await new Promise((res) => setTimeout(res, 400));
  return { data: { url } };
};

export const uploadsApi = {
  uploadImage: (formDataOrFile) => {
    // Accept either a FormData (from components) or a File directly
    const file = typeof File !== 'undefined' && formDataOrFile instanceof FormData
      ? formDataOrFile.get('file')
      : formDataOrFile?.get?.('file') || formDataOrFile;
    return simulateExternalUpload(file);
  },

  uploadVideo: (formDataOrFile) => {
    const file = typeof File !== 'undefined' && formDataOrFile instanceof FormData
      ? formDataOrFile.get('file')
      : formDataOrFile?.get?.('file') || formDataOrFile;
    return simulateExternalUpload(file);
  },
};
