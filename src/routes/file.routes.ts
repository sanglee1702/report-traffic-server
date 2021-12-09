import UploadControllers from '../controllers/file.controllers';
import express from 'express';

const FilesRouter = express.Router();

const FILE_PATH = '/files';

FilesRouter.post(`${FILE_PATH}/upload/**`, UploadControllers.uploadFiles);

FilesRouter.get(`${FILE_PATH}/download/**`, UploadControllers.download);
FilesRouter.get(`${FILE_PATH}`, UploadControllers.getListFiles);
FilesRouter.get(`${FILE_PATH}/bank-icons`, UploadControllers.getBankIcons);
FilesRouter.delete(`${FILE_PATH}/:id`, UploadControllers.deleteFileAsync);

export default FilesRouter;
