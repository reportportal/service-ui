import { useRef, useState } from 'react';
import { fetch } from 'common/utils';
import { formDataForServerUploading } from './utils';

export const useFilesUpload = (files, updateFile) => {
  const requestsCancellers = useRef([]);

  const uploadFile = (url, file, id) => {
    updateFile(id, { isLoading: true });

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data;' },
      data: file,
      abort: (cancelRequest) => {
        requestsCancellers.current.push(cancelRequest);
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        updateFile(id, { uploadingProgress: percentCompleted });
      },
    });
  };

  const uploadFiles = async (url, onSuccess = () => {}, onError = () => {}) => {
    const filesFormData = formDataForServerUploading(files);

    await Promise.allSettled(
      filesFormData.map(async ({ data, id }) => {
        try {
          await uploadFile(url, data, id);
          updateFile(id, { uploaded: true, isLoading: false, uploadFailed: false });
          onSuccess(id);
        } catch (err) {
          updateFile(id, {
            uploaded: true,
            isLoading: false,
            uploadFailed: true,
            uploadFailReason: err,
          });
          onError(id, err);
        }
      }),
    );
  };

  const cancelRequests = () => {
    requestsCancellers.current.forEach((cancelRequest) => cancelRequest());
  };

  return { uploadFiles, cancelRequests };
};

export const useFiles = () => {
  const [files, setFiles] = useState([]);

  // add array or single file
  const addFiles = (newFiles) => {
    setFiles((prevFiles) => prevFiles.concat(newFiles));
  };

  const removeFile = (id) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const updateFile = (id, data) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.id === id ? { ...file, ...data } : file)),
    );
  };

  return {
    files,
    actions: { addFiles, setFiles, removeFile, updateFile },
  };
};
