import isObject from './isObject';

export default function mapErrorsObjectToFeilmeldinger(errors) {
  const mapErrorsObject = (errors: any, subKey = ''): any[] => {
    if (isObject(errors)) {
      return Object.keys(errors).flatMap((key) => {
        if (typeof errors[key] === 'string') {
          return {
            key: subKey ? `${subKey}.${key}` : key,
            message: errors[key]
          };
        }

        if (!errors[key]?.message) {
          return mapErrorsObject(errors[key], subKey ? `${subKey}.${key}` : key);
        }

        return {
          key: subKey ? `${subKey}.${key}` : key,
          message: errors[key]?.message
        };
      });
    }
  };
  const errorsMapped = mapErrorsObject(errors);

  let feilmeldinger = [];
  if (Array.isArray(errorsMapped)) {
    feilmeldinger = errorsMapped.map((error) => {
      if (error) {
        return {
          felt: error.key,
          text: error.message
        };
      }
    });
  }
  return feilmeldinger.filter((melding) => !!melding);
}
