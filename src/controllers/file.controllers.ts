import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { envConfig } from '../config/env.config';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import FileService from '../services/files.service';
import { UnauthorizedError } from '../utils/error';
import uploadFileMiddleware from '../utils/upload';

const uploadFiles = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const path = request.params[0];

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const directoryPath = `uploads/${path}`;
  const dp = directoryPath.split('/');
  let directoryPathCreate = '';

  for (let item of dp) {
    directoryPathCreate += `${item}/`;

    if (!fs.existsSync(directoryPathCreate)) {
      fs.mkdirSync(directoryPathCreate);
    }
  }

  await uploadFileMiddleware(path, (err) => {
    return result.status(400).send({ message: err.message });
  })(request, result);

  const files = request.files;
  const fileType = request.body.fileType;
  const fileName = request.body.fileName;

  if (!files || !files.length)
    result.status(400).send({ message: 'Not found file' });

  const filesURL = (files as Express.Multer.File[]).map(
    (file) => `${envConfig.SERVER_BASE_URL}/files/${path}/${file.filename}`,
  );

  const filesURLData = filesURL.map((item, index) => {
    return {
      url: item,
      fileName: index > 0 ? `${fileName} ${index}` : fileName,
      objectStatus: ObjectStatus.Active,
      type: fileType,
    };
  });

  const res = await FileService.createList(filesURLData);

  return result.send(res);
};

const download = (request: Request, result: Response): void => {
  const fileName = request.params[0];
  const directoryPath = './uploads/';

  result.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      result.status(500).send({
        message: 'Could not download the file.',
      });
    }
  });
};

const getListFiles = async (request: Request, result: Response) => {
  const query: any = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);

  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const files = await FileService.getList(query);

  result.send(files);
};

const getFile = (request: Request, result: Response): void => {
  const fileName = request.params[0];
  const directoryPath = './uploads/';

  const options = {
    root: path.join(directoryPath),
  };

  result.sendFile(fileName, options, (err) => {
    if (err) {
      result.status(500).send({
        message: 'Could not get the file. ',
      });
    }
  });
};

const getBankIcons = (_: Request, result: Response): void => {
  const directoryPath = './assets/bank_icon/';

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      result.status(500).send({
        message: 'Unable to scan files!',
      });
    }

    result.send(
      files.map((file) => `${envConfig.SERVER_BASE_URL}/bank-icon/${file}`),
    );
  });
};

const getBankIcon = (request: Request, result: Response): void => {
  const fileName = request.params[0];
  const directoryPath = './assets/bank_icon/';

  const options = {
    root: path.join(directoryPath),
  };

  result.sendFile(fileName, options, (err) => {
    if (err) {
      result.status(500).send({
        message: 'Could not get the file. ',
      });
    }
  });
};

const deleteFileAsync = async (request: Request, result: Response) => {
  const id = Number(request.params.id);

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);

  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const hasDelete = await FileService.disabled(id);
  result.send(hasDelete);
};

export default {
  uploadFiles,
  download,
  getListFiles,
  getFile,
  getBankIcons,
  getBankIcon,
  deleteFileAsync,
};
