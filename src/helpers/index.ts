export const isDate = (date: any) => {
  const newData = new Date(date);
  const startDate = newData.getDate();

  return !isNaN(startDate);
};

export const hasEmail = (email: string) => {
  return !!email.match('[a-zA-Z0-9_\\.\\+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-\\.]+');
};

export const hasPhoneNumber = (phoneNumber: string) => {
  return !!phoneNumber.match('(84|0[3|5|7|8|9])+([0-9]{8})');
};

export function uuIdV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const generateOTP = (): string => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

export const generateOrderId = (): string => {
  const id = `${Math.floor(Math.random() * Math.floor(9999)) + 1111}`;

  return Math.floor(Date.now() / 1000) + id;
};

export const checkContentContainingAbsolutePath = (content: string) => {
  const regex = /src=["'](.*?)["']/gm;

  let hasAbsolutePath = false;

  const regExpMatchArray = content.match(regex);

  regExpMatchArray?.forEach((item) => {
    if (!item.match('data:image') && !item.match(/(http|https):[//]/)) {
      hasAbsolutePath = true;
    }
  });

  return hasAbsolutePath;
};

export const generateCode = (length: number): string => {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

export const checkLink = (link: string) => {
  return !!link.match(/(http|https):[//]/);
};
