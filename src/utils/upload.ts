import util from 'util';
import multer from 'multer';
import { uuIdV4 } from '../helpers';
import path from 'path';

const storage = (path: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, `uploads/${path}`);
    },
    filename: (_req, file, cb) => {
      const split = file.originalname.split('.');

      cb(null, uuIdV4() + '.' + split[split.length - 1]);
    },
  });

const uploadFile = (pathname: string, cbErr: (err: Error) => void) =>
  multer({
    storage: storage(pathname),
    fileFilter: function (_req, file, callback) {
      const ext = path.extname(file.originalname);
      if (ext === '.exe') {
        cbErr(new Error('File not allowed upload!'));
        return callback(new Error('File not allowed'));
      }
      callback(null, true);
    },
  }).any();

const uploadFileMiddleware = (path: string, cb: (err: Error) => void) =>
  util.promisify(uploadFile(path, cb));

export default uploadFileMiddleware;
